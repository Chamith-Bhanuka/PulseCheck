package user

import (
	"context"
	"testing"
)

type mockUserRepo struct {
	users map[string]*User
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[string]*User)}
}

func (m *mockUserRepo) Create(ctx context.Context, u *User) error {
	for _, existing := range m.users {
		if existing.Email == u.Email {
			return ErrUserAlreadyExists
		}
	}
	u.ID = "usr_test_123"
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*User, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, ErrUserNotFound
}

func (m *mockUserRepo) GetByID(ctx context.Context, id string) (*User, error) {
	u, ok := m.users[id]
	if !ok {
		return nil, ErrUserNotFound
	}
	return u, nil
}

func (m *mockUserRepo) GetByStripeCustomerID(ctx context.Context, customerID string) (*User, error) {
	for _, u := range m.users {
		if u.StripeCustomerID != nil && *u.StripeCustomerID == customerID {
			return u, nil
		}
	}
	return nil, ErrUserNotFound
}

func (m *mockUserRepo) UpdatePlan(ctx context.Context, id, plan string, customerID, subID *string) error {
	u, ok := m.users[id]
	if !ok {
		return ErrUserNotFound
	}
	u.Plan = plan
	u.StripeCustomerID = customerID
	u.StripeSubscriptionID = subID
	return nil
}

func TestUserService_RegisterAndLogin(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewService(repo, "jwt-secret", 15)
	ctx := context.Background()

	// 1. Weak password rejected
	_, err := svc.Register(ctx, "test@example.com", "short")
	if err == nil {
		t.Fatal("expected weak password error, got nil")
	}

	// 2. Invalid email rejected
	_, err = svc.Register(ctx, "not-an-email", "validpassword123")
	if err == nil {
		t.Fatal("expected invalid email error, got nil")
	}

	// 3. Successful registration
	authRes, err := svc.Register(ctx, "test@example.com", "validpassword123")
	if err != nil {
		t.Fatalf("unexpected error registering: %v", err)
	}
	if authRes.User.Email != "test@example.com" {
		t.Fatalf("expected email test@example.com, got %s", authRes.User.Email)
	}
	if authRes.User.Plan != PlanFree {
		t.Fatalf("expected default plan free, got %s", authRes.User.Plan)
	}
	if authRes.Token == "" {
		t.Fatal("expected non-empty auth token")
	}

	// 4. Duplicate registration rejected
	_, err = svc.Register(ctx, "test@example.com", "validpassword123")
	if err == nil {
		t.Fatal("expected duplicate registration error, got nil")
	}

	// 5. Successful login
	loginRes, err := svc.Login(ctx, "test@example.com", "validpassword123")
	if err != nil {
		t.Fatalf("unexpected error during login: %v", err)
	}
	if loginRes.Token == "" {
		t.Fatal("expected token on login")
	}

	// 6. Bad password rejected
	_, err = svc.Login(ctx, "test@example.com", "wrongpassword")
	if err == nil {
		t.Fatal("expected login failure on wrong password")
	}
}
