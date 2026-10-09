package monitor

import (
	"context"
	"fmt"
	"testing"

	"pulsecheck/internal/user"
)

type mockMonitorRepo struct {
	monitors map[string]*Monitor
}

func newMockMonitorRepo() *mockMonitorRepo {
	return &mockMonitorRepo{monitors: make(map[string]*Monitor)}
}

func (m *mockMonitorRepo) Create(ctx context.Context, item *Monitor) error {
	item.ID = fmt.Sprintf("mon_%d", len(m.monitors)+1)
	m.monitors[item.ID] = item
	return nil
}

func (m *mockMonitorRepo) GetByID(ctx context.Context, id, userID string) (*Monitor, error) {
	mon, ok := m.monitors[id]
	if !ok || mon.UserID != userID {
		return nil, ErrNotFound
	}
	return mon, nil
}

func (m *mockMonitorRepo) GetPublicByID(ctx context.Context, id string) (*Monitor, error) {
	mon, ok := m.monitors[id]
	if !ok {
		return nil, ErrNotFound
	}
	return mon, nil
}

func (m *mockMonitorRepo) ListByUserID(ctx context.Context, userID string) ([]*Monitor, error) {
	res := make([]*Monitor, 0)
	for _, mon := range m.monitors {
		if mon.UserID == userID {
			res = append(res, mon)
		}
	}
	return res, nil
}

func (m *mockMonitorRepo) ListActiveMonitors(ctx context.Context) ([]*Monitor, error) {
	res := make([]*Monitor, 0)
	for _, mon := range m.monitors {
		if mon.IsActive {
			res = append(res, mon)
		}
	}
	return res, nil
}

func (m *mockMonitorRepo) CountByUserID(ctx context.Context, userID string) (int, error) {
	count := 0
	for _, mon := range m.monitors {
		if mon.UserID == userID {
			count++
		}
	}
	return count, nil
}

func (m *mockMonitorRepo) Update(ctx context.Context, item *Monitor) error {
	existing, ok := m.monitors[item.ID]
	if !ok || existing.UserID != item.UserID {
		return ErrNotFound
	}
	m.monitors[item.ID] = item
	return nil
}

func (m *mockMonitorRepo) Delete(ctx context.Context, id, userID string) error {
	existing, ok := m.monitors[id]
	if !ok || existing.UserID != userID {
		return ErrNotFound
	}
	delete(m.monitors, id)
	return nil
}

func TestMonitorService_PlanLimitsAndInterval(t *testing.T) {
	repo := newMockMonitorRepo()
	svc := NewService(repo)
	ctx := context.Background()

	// 1. Invalid URL rejected
	_, err := svc.Create(ctx, "usr_1", "free", CreateRequest{
		URL:             "not-a-valid-url",
		IntervalSeconds: 300,
	})
	if err == nil {
		t.Fatal("expected invalid url error, got nil")
	}

	// 2. Free plan cannot use sub-300s interval
	_, err = svc.Create(ctx, "usr_1", "free", CreateRequest{
		URL:             "https://example.com/api",
		IntervalSeconds: 60,
	})
	if err == nil {
		t.Fatal("expected error for interval below 300s on free plan")
	}

	// 3. Paid plan can use 30s interval
	monPaid, err := svc.Create(ctx, "usr_1", "paid", CreateRequest{
		URL:             "https://example.com/api",
		IntervalSeconds: 30,
	})
	if err != nil {
		t.Fatalf("unexpected error creating paid monitor with 30s: %v", err)
	}
	if monPaid.IntervalSeconds != 30 {
		t.Errorf("expected interval 30, got %d", monPaid.IntervalSeconds)
	}

	// 4. Fill up to free tier limit (5)
	userFree := "usr_free"
	for i := 0; i < FreeMaxMonitors; i++ {
		_, err := svc.Create(ctx, userFree, "free", CreateRequest{
			URL:             "https://example.com/health",
			IntervalSeconds: 300,
		})
		if err != nil {
			t.Fatalf("failed inserting monitor %d: %v", i, err)
		}
	}

	// 5. 6th monitor on free plan rejected
	_, err = svc.Create(ctx, userFree, "free", CreateRequest{
		URL:             "https://example.com/extra",
		IntervalSeconds: 300,
	})
	if err == nil {
		t.Fatal("expected plan limit exceeded error, got nil")
	}

	// 6. Cross-tenant access isolation check
	_, err = svc.Get(ctx, monPaid.ID, "some_other_tenant_id")
	if err == nil {
		t.Fatal("expected not found error when accessing other tenant's monitor")
	}
}

type mockUserRepoForMonitor struct {
	users map[string]*user.User
}

func (m *mockUserRepoForMonitor) Create(ctx context.Context, u *user.User) error {
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepoForMonitor) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, user.ErrUserNotFound
}

func (m *mockUserRepoForMonitor) GetByID(ctx context.Context, id string) (*user.User, error) {
	u, ok := m.users[id]
	if !ok {
		return nil, user.ErrUserNotFound
	}
	return u, nil
}

func (m *mockUserRepoForMonitor) GetByStripeCustomerID(ctx context.Context, customerID string) (*user.User, error) {
	return nil, user.ErrUserNotFound
}

func (m *mockUserRepoForMonitor) UpdatePlan(ctx context.Context, id, plan string, customerID, subID *string) error {
	if u, ok := m.users[id]; ok {
		u.Plan = plan
	}
	return nil
}

func TestMonitorService_LiveUserRepoPlan(t *testing.T) {
	repo := newMockMonitorRepo()
	userRepo := &mockUserRepoForMonitor{
		users: map[string]*user.User{
			"usr_upgraded": {
				ID:    "usr_upgraded",
				Email: "pro@example.com",
				Plan:  "paid", // Upgraded in database
			},
			"usr_free": {
				ID:    "usr_free",
				Email: "free@example.com",
				Plan:  "free",
			},
		},
	}

	svc := NewService(repo, userRepo)
	ctx := context.Background()

	// 1. Upgraded user has a stale "free" token claim from before upgrade,
	// but live DB record has "paid". Creating a 30-second monitor MUST succeed!
	mon, err := svc.Create(ctx, "usr_upgraded", "free", CreateRequest{
		Name:            "Pro Service",
		URL:             "https://api.example.com/health",
		IntervalSeconds: 30,
	})
	if err != nil {
		t.Fatalf("expected pro monitor with 30s interval to succeed via live user plan, got: %v", err)
	}
	if mon.IntervalSeconds != 30 {
		t.Fatalf("expected interval 30, got %d", mon.IntervalSeconds)
	}

	// 2. Upgraded user can update monitor to 60 seconds even if token plan claim is "free"
	sixtySec := 60
	monUpdated, err := svc.Update(ctx, mon.ID, "usr_upgraded", "free", UpdateRequest{
		IntervalSeconds: &sixtySec,
	})
	if err != nil {
		t.Fatalf("expected pro monitor update with 60s interval to succeed, got: %v", err)
	}
	if monUpdated.IntervalSeconds != 60 {
		t.Fatalf("expected interval 60, got %d", monUpdated.IntervalSeconds)
	}

	// 3. User genuinely on "free" plan cannot set 30s interval
	_, err = svc.Create(ctx, "usr_free", "free", CreateRequest{
		Name:            "Free Service",
		URL:             "https://api.example.com/health",
		IntervalSeconds: 30,
	})
	if err == nil {
		t.Fatal("expected interval error for genuinely free user setting 30s interval, got nil")
	}
}

