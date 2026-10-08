package user

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user with this email already exists")
)

type Repository interface {
	Create(ctx context.Context, user *User) error
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, id string) (*User, error)
	GetByStripeCustomerID(ctx context.Context, customerID string) (*User, error)
	UpdatePlan(ctx context.Context, id, plan string, customerID, subID *string) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, u *User) error {
	query := `
		INSERT INTO users (email, password_hash, plan, stripe_customer_id, stripe_subscription_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		u.Email,
		u.PasswordHash,
		u.Plan,
		u.StripeCustomerID,
		u.StripeSubscriptionID,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return err
		}
		// Check for unique constraint violation in Postgres
		if isUniqueViolation(err) {
			return ErrUserAlreadyExists
		}
		return fmt.Errorf("failed to insert user: %w", err)
	}

	return nil
}

func (r *postgresRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, password_hash, plan, stripe_customer_id, stripe_subscription_id, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var u User
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Plan,
		&u.StripeCustomerID,
		&u.StripeSubscriptionID,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to fetch user by email: %w", err)
	}

	return &u, nil
}

func (r *postgresRepository) GetByID(ctx context.Context, id string) (*User, error) {
	query := `
		SELECT id, email, password_hash, plan, stripe_customer_id, stripe_subscription_id, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var u User
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Plan,
		&u.StripeCustomerID,
		&u.StripeSubscriptionID,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to fetch user by id: %w", err)
	}

	return &u, nil
}

func (r *postgresRepository) GetByStripeCustomerID(ctx context.Context, customerID string) (*User, error) {
	query := `
		SELECT id, email, password_hash, plan, stripe_customer_id, stripe_subscription_id, created_at, updated_at
		FROM users
		WHERE stripe_customer_id = $1
	`

	var u User
	err := r.db.QueryRowContext(ctx, query, customerID).Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Plan,
		&u.StripeCustomerID,
		&u.StripeSubscriptionID,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to fetch user by stripe customer id: %w", err)
	}

	return &u, nil
}

func (r *postgresRepository) UpdatePlan(ctx context.Context, id, plan string, customerID, subID *string) error {
	query := `
		UPDATE users
		SET plan = $1, stripe_customer_id = $2, stripe_subscription_id = $3, updated_at = NOW()
		WHERE id = $4
	`

	res, err := r.db.ExecContext(ctx, query, plan, customerID, subID, id)
	if err != nil {
		return fmt.Errorf("failed to update user plan: %w", err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrUserNotFound
	}

	return nil
}

func isUniqueViolation(err error) bool {
	// Standard PostgreSQL unique violation error code is 23505
	return err != nil && (contains(err.Error(), "23505") || contains(err.Error(), "unique constraint"))
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && (containsHelper(s, substr)))
}

func containsHelper(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
