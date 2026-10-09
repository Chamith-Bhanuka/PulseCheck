package monitor

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"

	"pulsecheck/internal/user"
)

var (
	ErrPlanLimitExceeded   = errors.New("plan monitor limit reached")
	ErrIntervalTooLow      = errors.New("check interval is below allowed minimum for your plan")
	ErrInvalidURL          = errors.New("url must be a valid http or https address")
	ErrInvalidMethod       = errors.New("unsupported http method")
	ErrInvalidStatusCode   = errors.New("expected status code must be between 100 and 599")
)

type Service interface {
	Create(ctx context.Context, userID, plan string, req CreateRequest) (*Monitor, error)
	List(ctx context.Context, userID string) ([]*Monitor, error)
	Get(ctx context.Context, id, userID string) (*Monitor, error)
	GetPublic(ctx context.Context, id string) (*Monitor, error)
	Update(ctx context.Context, id, userID, plan string, req UpdateRequest) (*Monitor, error)
	Delete(ctx context.Context, id, userID string) error
}

type EngineListener interface {
	StartMonitor(m *Monitor)
	StopMonitor(monitorID string)
}

type service struct {
	repo     Repository
	userRepo user.Repository
	listener EngineListener
}

func NewService(repo Repository, optional ...interface{}) Service {
	s := &service{repo: repo}
	for _, opt := range optional {
		switch v := opt.(type) {
		case user.Repository:
			s.userRepo = v
		case EngineListener:
			s.listener = v
		}
	}
	return s
}

func (s *service) Create(ctx context.Context, userID, plan string, req CreateRequest) (*Monitor, error) {
	// Look up live user plan from repository if available to avoid stale JWT claims
	if s.userRepo != nil {
		if u, err := s.userRepo.GetByID(ctx, userID); err == nil && u != nil && u.Plan != "" {
			plan = u.Plan
		}
	}

	maxAllowed := FreeMaxMonitors
	minInterval := FreeMinIntervalSec
	if strings.EqualFold(plan, "paid") || strings.EqualFold(plan, "pro") {
		maxAllowed = PaidMaxMonitors
		minInterval = PaidMinIntervalSec
	}

	// 1. Enforce plan monitor count limit
	count, err := s.repo.CountByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to verify plan limits: %w", err)
	}

	if count >= maxAllowed {
		return nil, fmt.Errorf("%w: %s plan allows a maximum of %d monitors", ErrPlanLimitExceeded, plan, maxAllowed)
	}

	// 2. Validate interval against tier
	if req.IntervalSeconds == 0 {
		req.IntervalSeconds = minInterval
	}
	if req.IntervalSeconds < minInterval {
		return nil, fmt.Errorf("%w: %s plan requires at least %d seconds", ErrIntervalTooLow, plan, minInterval)
	}

	// 3. Validate URL
	req.URL = strings.TrimSpace(req.URL)
	parsedURL, err := url.ParseRequestURI(req.URL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		return nil, ErrInvalidURL
	}

	// 4. Validate Method & Status Code
	if req.Method == "" {
		req.Method = "GET"
	}
	req.Method = strings.ToUpper(strings.TrimSpace(req.Method))
	if !isValidMethod(req.Method) {
		return nil, ErrInvalidMethod
	}

	if req.ExpectedStatus == 0 {
		req.ExpectedStatus = 200
	}
	if req.ExpectedStatus < 100 || req.ExpectedStatus > 599 {
		return nil, ErrInvalidStatusCode
	}

	if req.Name == "" {
		req.Name = parsedURL.Host
	}

	m := &Monitor{
		UserID:          userID,
		Name:            req.Name,
		URL:             req.URL,
		Method:          req.Method,
		ExpectedStatus:  req.ExpectedStatus,
		IntervalSeconds: req.IntervalSeconds,
		IsActive:        true,
	}

	if err := s.repo.Create(ctx, m); err != nil {
		return nil, fmt.Errorf("failed to save monitor: %w", err)
	}

	if s.listener != nil && m.IsActive {
		s.listener.StartMonitor(m)
	}

	return m, nil
}

func (s *service) List(ctx context.Context, userID string) ([]*Monitor, error) {
	return s.repo.ListByUserID(ctx, userID)
}

func (s *service) Get(ctx context.Context, id, userID string) (*Monitor, error) {
	return s.repo.GetByID(ctx, id, userID)
}

func (s *service) GetPublic(ctx context.Context, id string) (*Monitor, error) {
	return s.repo.GetPublicByID(ctx, id)
}

func (s *service) Update(ctx context.Context, id, userID, plan string, req UpdateRequest) (*Monitor, error) {
	m, err := s.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}

	// Look up live user plan from repository if available to avoid stale JWT claims
	if s.userRepo != nil {
		if u, err := s.userRepo.GetByID(ctx, userID); err == nil && u != nil && u.Plan != "" {
			plan = u.Plan
		}
	}

	if req.Name != nil {
		m.Name = strings.TrimSpace(*req.Name)
	}
	if req.URL != nil {
		uStr := strings.TrimSpace(*req.URL)
		parsedURL, err := url.ParseRequestURI(uStr)
		if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
			return nil, ErrInvalidURL
		}
		m.URL = uStr
	}
	if req.Method != nil {
		method := strings.ToUpper(strings.TrimSpace(*req.Method))
		if !isValidMethod(method) {
			return nil, ErrInvalidMethod
		}
		m.Method = method
	}
	if req.ExpectedStatus != nil {
		if *req.ExpectedStatus < 100 || *req.ExpectedStatus > 599 {
			return nil, ErrInvalidStatusCode
		}
		m.ExpectedStatus = *req.ExpectedStatus
	}
	if req.IntervalSeconds != nil {
		minInterval := FreeMinIntervalSec
		if strings.EqualFold(plan, "paid") || strings.EqualFold(plan, "pro") {
			minInterval = PaidMinIntervalSec
		}
		if *req.IntervalSeconds < minInterval {
			return nil, fmt.Errorf("%w: %s plan requires at least %d seconds", ErrIntervalTooLow, plan, minInterval)
		}
		m.IntervalSeconds = *req.IntervalSeconds
	}
	if req.IsActive != nil {
		m.IsActive = *req.IsActive
	}

	if err := s.repo.Update(ctx, m); err != nil {
		return nil, err
	}

	if s.listener != nil {
		if m.IsActive {
			s.listener.StartMonitor(m)
		} else {
			s.listener.StopMonitor(m.ID)
		}
	}

	return m, nil
}

func (s *service) Delete(ctx context.Context, id, userID string) error {
	if err := s.repo.Delete(ctx, id, userID); err != nil {
		return err
	}

	if s.listener != nil {
		s.listener.StopMonitor(id)
	}

	return nil
}

func isValidMethod(method string) bool {
	switch method {
	case "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD":
		return true
	default:
		return false
	}
}
