package check

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"pulsecheck/internal/monitor"
	"pulsecheck/internal/user"
)

type mockCheckRepo struct {
	mu      sync.Mutex
	results []*Result
}

func newMockCheckRepo() *mockCheckRepo {
	return &mockCheckRepo{results: make([]*Result, 0)}
}

func (m *mockCheckRepo) SaveResult(ctx context.Context, res *Result) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	res.ID = "chk_1"
	m.results = append(m.results, res)
	return nil
}

func (m *mockCheckRepo) GetLatestResult(ctx context.Context, monitorID string) (*Result, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.results) == 0 {
		return nil, nil
	}
	return m.results[len(m.results)-1], nil
}

func (m *mockCheckRepo) ListRecentChecks(ctx context.Context, monitorID string, limit int) ([]*Result, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.results, nil
}

func (m *mockCheckRepo) GetUptimeStats(ctx context.Context, monitorID string, since time.Time) (*UptimeStats, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	total := len(m.results)
	success := 0
	for _, r := range m.results {
		if r.Success {
			success++
		}
	}
	uptime := 100.0
	if total > 0 {
		uptime = (float64(success) / float64(total)) * 100.0
	}

	return &UptimeStats{
		UptimePercentage: uptime,
		TotalChecks:      total,
		SuccessfulChecks: success,
		FailedChecks:     total - success,
	}, nil
}

type mockMonitorRepoForCheck struct {
	monitors map[string]*monitor.Monitor
}

func (m *mockMonitorRepoForCheck) ListActiveMonitors(ctx context.Context) ([]*monitor.Monitor, error) {
	var list []*monitor.Monitor
	for _, mon := range m.monitors {
		if mon.IsActive {
			list = append(list, mon)
		}
	}
	return list, nil
}

func (m *mockMonitorRepoForCheck) Create(ctx context.Context, item *monitor.Monitor) error { return nil }
func (m *mockMonitorRepoForCheck) GetByID(ctx context.Context, id, userID string) (*monitor.Monitor, error) {
	mon, ok := m.monitors[id]
	if !ok || mon.UserID != userID {
		return nil, monitor.ErrNotFound
	}
	return mon, nil
}
func (m *mockMonitorRepoForCheck) GetPublicByID(ctx context.Context, id string) (*monitor.Monitor, error) {
	mon, ok := m.monitors[id]
	if !ok {
		return nil, monitor.ErrNotFound
	}
	return mon, nil
}
func (m *mockMonitorRepoForCheck) ListByUserID(ctx context.Context, userID string) ([]*monitor.Monitor, error) {
	return nil, nil
}
func (m *mockMonitorRepoForCheck) CountByUserID(ctx context.Context, userID string) (int, error) {
	return len(m.monitors), nil
}
func (m *mockMonitorRepoForCheck) Update(ctx context.Context, item *monitor.Monitor) error { return nil }
func (m *mockMonitorRepoForCheck) Delete(ctx context.Context, id, userID string) error     { return nil }

type mockUserRepoForCheck struct{}

func (m *mockUserRepoForCheck) Create(ctx context.Context, u *user.User) error { return nil }
func (m *mockUserRepoForCheck) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	return nil, nil
}
func (m *mockUserRepoForCheck) GetByID(ctx context.Context, id string) (*user.User, error) {
	return &user.User{ID: id, Email: "user@pulsecheck.dev"}, nil
}
func (m *mockUserRepoForCheck) GetByStripeCustomerID(ctx context.Context, customerID string) (*user.User, error) {
	return nil, nil
}
func (m *mockUserRepoForCheck) UpdatePlan(ctx context.Context, id, plan string, customerID, subID *string) error {
	return nil
}

type mockNotifier struct {
	mu           sync.Mutex
	alertInvoked bool
}

func (m *mockNotifier) SendDowntimeAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, reason string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.alertInvoked = true
	return nil
}

func TestCheckEngine_ExecutionAndAlerting(t *testing.T) {
	// 1. Create a simulated HTTP test target
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/down" {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("healthy"))
	}))
	defer ts.Close()

	checkRepo := newMockCheckRepo()
	monRepo := &mockMonitorRepoForCheck{monitors: map[string]*monitor.Monitor{
		"m1": {
			ID:              "m1",
			UserID:          "u1",
			Name:            "Healthy App",
			URL:             ts.URL + "/health",
			Method:          "GET",
			ExpectedStatus:  200,
			IntervalSeconds: 30,
			IsActive:        true,
		},
		"m2": {
			ID:              "m2",
			UserID:          "u1",
			Name:            "Failing App",
			URL:             ts.URL + "/down",
			Method:          "GET",
			ExpectedStatus:  200,
			IntervalSeconds: 30,
			IsActive:        true,
		},
	}}
	userRepo := &mockUserRepoForCheck{}
	notifier := &mockNotifier{}

	engine := NewEngine(checkRepo, monRepo, userRepo, notifier, 5)
	ctx := context.Background()

	// 2. Execute healthy check
	resOK := engine.ExecuteSingleCheck(ctx, monRepo.monitors["m1"])
	if !resOK.Success {
		t.Fatalf("expected successful check on healthy target")
	}
	if resOK.StatusCode != 200 {
		t.Fatalf("expected status 200, got %d", resOK.StatusCode)
	}

	// 3. Execute failing check (should trigger downtime alert)
	resDown := engine.ExecuteSingleCheck(ctx, monRepo.monitors["m2"])
	if resDown.Success {
		t.Fatalf("expected check failure on 503 target")
	}
	if resDown.StatusCode != 503 {
		t.Fatalf("expected status 503, got %d", resDown.StatusCode)
	}

	notifier.mu.Lock()
	alerted := notifier.alertInvoked
	notifier.mu.Unlock()

	if !alerted {
		t.Fatal("expected downtime alert to be triggered on failing endpoint")
	}
}

func TestCheckEngine_MonitorUpdateAndReconciliation(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v2" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("v2"))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("v1"))
	}))
	defer ts.Close()

	checkRepo := newMockCheckRepo()
	monRepo := &mockMonitorRepoForCheck{monitors: map[string]*monitor.Monitor{
		"m1": {
			ID:              "m1",
			UserID:          "u1",
			Name:            "App",
			URL:             ts.URL + "/v1",
			Method:          "GET",
			ExpectedStatus:  200,
			IntervalSeconds: 30,
			IsActive:        true,
			UpdatedAt:       time.Now(),
		},
	}}
	userRepo := &mockUserRepoForCheck{}
	notifier := &mockNotifier{}

	engine := NewEngine(checkRepo, monRepo, userRepo, notifier, 5)

	// 1. Start monitor initially with /v1
	engine.StartMonitor(monRepo.monitors["m1"])

	engine.mu.RLock()
	cfg := engine.runningConfigs["m1"]
	engine.mu.RUnlock()

	if cfg == nil || cfg.URL != ts.URL+"/v1" {
		t.Fatalf("expected running config URL to be %s, got %v", ts.URL+"/v1", cfg)
	}

	// 2. Update monitor to /v2 and call StartMonitor
	updated := &monitor.Monitor{
		ID:              "m1",
		UserID:          "u1",
		Name:            "App",
		URL:             ts.URL + "/v2",
		Method:          "GET",
		ExpectedStatus:  200,
		IntervalSeconds: 30,
		IsActive:        true,
		UpdatedAt:       time.Now().Add(time.Second),
	}
	engine.StartMonitor(updated)

	engine.mu.RLock()
	cfgUpdated := engine.runningConfigs["m1"]
	engine.mu.RUnlock()

	if cfgUpdated == nil || cfgUpdated.URL != ts.URL+"/v2" {
		t.Fatalf("expected running config URL to be %s after update, got %v", ts.URL+"/v2", cfgUpdated)
	}

	// 3. Stop monitor
	engine.StopMonitor("m1")
	engine.mu.RLock()
	_, exists := engine.runningConfigs["m1"]
	engine.mu.RUnlock()

	if exists {
		t.Fatalf("expected running config to be removed after StopMonitor")
	}
}

