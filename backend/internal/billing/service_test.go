package billing

import (
	"context"
	"testing"

	"pulsecheck/internal/user"
)

type mockUserRepoForBilling struct {
	users map[string]*user.User
}

func (m *mockUserRepoForBilling) Create(ctx context.Context, u *user.User) error { return nil }
func (m *mockUserRepoForBilling) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	return nil, nil
}
func (m *mockUserRepoForBilling) GetByID(ctx context.Context, id string) (*user.User, error) {
	return m.users[id], nil
}
func (m *mockUserRepoForBilling) GetByStripeCustomerID(ctx context.Context, customerID string) (*user.User, error) {
	for _, u := range m.users {
		if u.StripeCustomerID != nil && *u.StripeCustomerID == customerID {
			return u, nil
		}
	}
	return nil, user.ErrUserNotFound
}
func (m *mockUserRepoForBilling) UpdatePlan(ctx context.Context, id, plan string, customerID, subID *string) error {
	u, ok := m.users[id]
	if !ok {
		return user.ErrUserNotFound
	}
	u.Plan = plan
	u.StripeCustomerID = customerID
	u.StripeSubscriptionID = subID
	return nil
}

func TestBillingService_Validation(t *testing.T) {
	repo := &mockUserRepoForBilling{users: make(map[string]*user.User)}
	// Empty price ID should fail fast
	svc := NewService(repo, "sk_test_123", "whsec_123", "", "http://localhost:5173")

	_, err := svc.CreateCheckoutSession(context.Background(), "u1", "user@test.com")
	if err == nil {
		t.Fatal("expected error when STRIPE_PRICE_ID is empty, got nil")
	}

	// Invalid webhook signature should fail
	err = svc.HandleWebhook(context.Background(), []byte(`{"id":"evt_1"}`), "invalid_sig")
	if err == nil {
		t.Fatal("expected error on invalid signature, got nil")
	}
}
