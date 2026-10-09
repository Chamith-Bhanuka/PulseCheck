package check

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"pulsecheck/internal/monitor"
	"pulsecheck/internal/user"
)

type Engine struct {
	checkRepo   Repository
	monitorRepo monitor.Repository
	userRepo    user.Repository
	notifier    Notifier
	httpClient  *http.Client

	// Semaphore channel caps concurrent outbound HTTP checks.
	// We use a buffered channel semaphore rather than unbounded goroutines
	// to prevent socket exhaustion and excessive context switches under heavy monitor counts.
	semaphore chan struct{}

	// WaitGroup coordinates graceful engine shutdown, ensuring in-flight
	// checks complete before server process termination.
	wg sync.WaitGroup

	// Mutex guards monitor worker cancellation handles across concurrent updates.
	mu             sync.RWMutex
	monitors       map[string]context.CancelFunc
	runningConfigs map[string]*monitor.Monitor

	rootCtx    context.Context
	cancelRoot context.CancelFunc
}

func NewEngine(
	checkRepo Repository,
	monitorRepo monitor.Repository,
	userRepo user.Repository,
	notifier Notifier,
	maxConcurrentWorkers int,
) *Engine {
	if maxConcurrentWorkers <= 0 {
		maxConcurrentWorkers = 20
	}

	ctx, cancel := context.WithCancel(context.Background())

	return &Engine{
		checkRepo:   checkRepo,
		monitorRepo: monitorRepo,
		userRepo:    userRepo,
		notifier:    notifier,
		httpClient: &http.Client{
			// Hard ceiling on HTTP transport, individual calls use context timeout
			Timeout: 12 * time.Second,
		},
		semaphore:      make(chan struct{}, maxConcurrentWorkers),
		monitors:       make(map[string]context.CancelFunc),
		runningConfigs: make(map[string]*monitor.Monitor),
		rootCtx:        ctx,
		cancelRoot:     cancel,
	}
}

// Start boots background reconciliation and starts active monitors.
func (e *Engine) Start() error {
	active, err := e.monitorRepo.ListActiveMonitors(e.rootCtx)
	if err != nil {
		return fmt.Errorf("failed to fetch active monitors for engine: %w", err)
	}

	for _, m := range active {
		e.StartMonitor(m)
	}

	// Periodic reconciler checks for newly added or modified monitors
	e.wg.Add(1)
	go e.runReconciliationLoop()

	return nil
}

func (e *Engine) Stop() {
	e.cancelRoot()

	e.mu.Lock()
	for id, cancel := range e.monitors {
		cancel()
		delete(e.monitors, id)
		delete(e.runningConfigs, id)
	}
	e.mu.Unlock()

	e.wg.Wait()
}

func (e *Engine) StartMonitor(m *monitor.Monitor) {
	e.mu.Lock()
	defer e.mu.Unlock()

	// If a goroutine is already running for this monitor, cancel it first
	if cancel, exists := e.monitors[m.ID]; exists {
		cancel()
	}

	ctx, cancel := context.WithCancel(e.rootCtx)
	e.monitors[m.ID] = cancel
	copyM := *m
	e.runningConfigs[m.ID] = &copyM

	e.wg.Add(1)
	go e.runMonitorLoop(ctx, &copyM)
}

func (e *Engine) StopMonitor(monitorID string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if cancel, exists := e.monitors[monitorID]; exists {
		cancel()
		delete(e.monitors, monitorID)
		delete(e.runningConfigs, monitorID)
	}
}

func (e *Engine) runReconciliationLoop() {
	defer e.wg.Done()
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-e.rootCtx.Done():
			return
		case <-ticker.C:
			active, err := e.monitorRepo.ListActiveMonitors(e.rootCtx)
			if err != nil {
				continue
			}

			activeIDs := make(map[string]bool)
			for _, m := range active {
				activeIDs[m.ID] = true
				e.mu.RLock()
				cfg, isRunning := e.runningConfigs[m.ID]
				e.mu.RUnlock()

				needsRestart := !isRunning ||
					cfg.URL != m.URL ||
					cfg.Method != m.Method ||
					cfg.ExpectedStatus != m.ExpectedStatus ||
					cfg.IntervalSeconds != m.IntervalSeconds ||
					cfg.IsActive != m.IsActive ||
					!cfg.UpdatedAt.Equal(m.UpdatedAt)

				if needsRestart {
					e.StartMonitor(m)
				}
			}

			// Clean up monitors that are no longer active
			e.mu.Lock()
			for id, cancel := range e.monitors {
				if !activeIDs[id] {
					cancel()
					delete(e.monitors, id)
					delete(e.runningConfigs, id)
				}
			}
			e.mu.Unlock()
		}
	}
}

func (e *Engine) runMonitorLoop(ctx context.Context, m *monitor.Monitor) {
	defer e.wg.Done()

	interval := time.Duration(m.IntervalSeconds) * time.Second
	if interval < 5*time.Second {
		interval = 5 * time.Second
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	// Execute an initial check immediately on schedule start
	e.dispatchCheck(ctx, m)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			e.dispatchCheck(ctx, m)
		}
	}
}

func (e *Engine) dispatchCheck(ctx context.Context, m *monitor.Monitor) {
	// Acquire semaphore slot or abort if context cancelled
	select {
	case <-ctx.Done():
		return
	case e.semaphore <- struct{}{}:
	}

	e.wg.Add(1)
	go func() {
		defer func() {
			<-e.semaphore
			e.wg.Done()
		}()

		e.ExecuteSingleCheck(ctx, m)
	}()
}

// ExecuteSingleCheck performs the ping, records latency and status, and dispatches alerts on failure.
func (e *Engine) ExecuteSingleCheck(ctx context.Context, m *monitor.Monitor) *Result {
	// 10-second timeout prevents an uncooperative or hanging server from stalling worker slots
	checkCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	start := time.Now()
	req, err := http.NewRequestWithContext(checkCtx, m.Method, m.URL, nil)
	
	var statusCode int
	var success bool
	var errMsg *string

	if err != nil {
		errStr := err.Error()
		errMsg = &errStr
	} else {
		req.Header.Set("User-Agent", "PulseCheck-Uptime-Bot/1.0")
		resp, reqErr := e.httpClient.Do(req)
		if reqErr != nil {
			errStr := reqErr.Error()
			errMsg = &errStr
		} else {
			statusCode = resp.StatusCode
			resp.Body.Close()

			expected := m.ExpectedStatus
			if expected == 0 {
				expected = 200
			}
			success = (statusCode == expected)
			if !success {
				msg := fmt.Sprintf("expected status %d, got %d", expected, statusCode)
				errMsg = &msg
			}
		}
	}

	latency := int(time.Since(start).Milliseconds())

	result := &Result{
		MonitorID:      m.ID,
		StatusCode:     statusCode,
		ResponseTimeMs: latency,
		Success:        success,
		ErrorMessage:   errMsg,
		CheckedAt:      time.Now(),
	}

	// 1. Fetch previous state to detect transitions
	lastResult, _ := e.checkRepo.GetLatestResult(ctx, m.ID)

	// 2. Persist current check result
	_ = e.checkRepo.SaveResult(ctx, result)

	// 3. Alert on failure transition (was up, now down, or initial failure)
	if !success && (lastResult == nil || lastResult.Success) {
		e.triggerDowntimeAlert(ctx, m, statusCode, errMsg)
	}

	// 4. Alert on recovery transition (was down, now restored)
	if success && lastResult != nil && !lastResult.Success {
		e.triggerRecoveryAlert(ctx, m, statusCode, latency)
	}

	return result
}

func (e *Engine) triggerDowntimeAlert(ctx context.Context, m *monitor.Monitor, statusCode int, errMsg *string) {
	reason := "Service unreachable or connection failed"
	if errMsg != nil {
		reason = *errMsg
	}

	u, err := e.userRepo.GetByID(ctx, m.UserID)
	if err != nil {
		return
	}

	_ = e.notifier.SendDowntimeAlert(ctx, u.Email, m.Name, m.URL, statusCode, reason)
}

func (e *Engine) triggerRecoveryAlert(ctx context.Context, m *monitor.Monitor, statusCode int, latency int) {
	u, err := e.userRepo.GetByID(ctx, m.UserID)
	if err != nil {
		return
	}

	_ = e.notifier.SendRecoveryAlert(ctx, u.Email, m.Name, m.URL, statusCode, latency)
}
