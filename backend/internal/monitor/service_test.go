package monitor

import (
	"context"
	"fmt"
	"testing"
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
