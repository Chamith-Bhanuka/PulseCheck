package monitor

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

var (
	ErrNotFound = errors.New("monitor not found")
)

type Repository interface {
	Create(ctx context.Context, m *Monitor) error
	GetByID(ctx context.Context, id, userID string) (*Monitor, error)
	GetPublicByID(ctx context.Context, id string) (*Monitor, error)
	ListByUserID(ctx context.Context, userID string) ([]*Monitor, error)
	ListActiveMonitors(ctx context.Context) ([]*Monitor, error)
	CountByUserID(ctx context.Context, userID string) (int, error)
	Update(ctx context.Context, m *Monitor) error
	Delete(ctx context.Context, id, userID string) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, m *Monitor) error {
	query := `
		INSERT INTO monitors (user_id, name, url, method, expected_status, interval_seconds, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		m.UserID,
		m.Name,
		m.URL,
		m.Method,
		m.ExpectedStatus,
		m.IntervalSeconds,
		m.IsActive,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

func (r *postgresRepository) GetByID(ctx context.Context, id, userID string) (*Monitor, error) {
	query := `
		SELECT id, user_id, name, url, method, expected_status, interval_seconds, is_active, created_at, updated_at
		FROM monitors
		WHERE id = $1 AND user_id = $2
	`

	var m Monitor
	err := r.db.QueryRowContext(ctx, query, id, userID).Scan(
		&m.ID,
		&m.UserID,
		&m.Name,
		&m.URL,
		&m.Method,
		&m.ExpectedStatus,
		&m.IntervalSeconds,
		&m.IsActive,
		&m.CreatedAt,
		&m.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to fetch monitor: %w", err)
	}

	return &m, nil
}

func (r *postgresRepository) GetPublicByID(ctx context.Context, id string) (*Monitor, error) {
	query := `
		SELECT id, user_id, name, url, method, expected_status, interval_seconds, is_active, created_at, updated_at
		FROM monitors
		WHERE id = $1
	`

	var m Monitor
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&m.ID,
		&m.UserID,
		&m.Name,
		&m.URL,
		&m.Method,
		&m.ExpectedStatus,
		&m.IntervalSeconds,
		&m.IsActive,
		&m.CreatedAt,
		&m.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to fetch public monitor: %w", err)
	}

	return &m, nil
}

func (r *postgresRepository) ListByUserID(ctx context.Context, userID string) ([]*Monitor, error) {
	query := `
		SELECT id, user_id, name, url, method, expected_status, interval_seconds, is_active, created_at, updated_at
		FROM monitors
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list user monitors: %w", err)
	}
	defer rows.Close()

	monitors := make([]*Monitor, 0)
	for rows.Next() {
		var m Monitor
		if err := rows.Scan(
			&m.ID,
			&m.UserID,
			&m.Name,
			&m.URL,
			&m.Method,
			&m.ExpectedStatus,
			&m.IntervalSeconds,
			&m.IsActive,
			&m.CreatedAt,
			&m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan monitor row: %w", err)
		}
		monitors = append(monitors, &m)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return monitors, nil
}

func (r *postgresRepository) ListActiveMonitors(ctx context.Context) ([]*Monitor, error) {
	query := `
		SELECT id, user_id, name, url, method, expected_status, interval_seconds, is_active, created_at, updated_at
		FROM monitors
		WHERE is_active = true
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list active monitors: %w", err)
	}
	defer rows.Close()

	monitors := make([]*Monitor, 0)
	for rows.Next() {
		var m Monitor
		if err := rows.Scan(
			&m.ID,
			&m.UserID,
			&m.Name,
			&m.URL,
			&m.Method,
			&m.ExpectedStatus,
			&m.IntervalSeconds,
			&m.IsActive,
			&m.CreatedAt,
			&m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan monitor row: %w", err)
		}
		monitors = append(monitors, &m)
	}

	return monitors, rows.Err()
}

func (r *postgresRepository) CountByUserID(ctx context.Context, userID string) (int, error) {
	query := `SELECT COUNT(*) FROM monitors WHERE user_id = $1`
	var count int
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count monitors: %w", err)
	}
	return count, nil
}

func (r *postgresRepository) Update(ctx context.Context, m *Monitor) error {
	query := `
		UPDATE monitors
		SET name = $1, url = $2, method = $3, expected_status = $4, interval_seconds = $5, is_active = $6, updated_at = NOW()
		WHERE id = $7 AND user_id = $8
		RETURNING updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		m.Name,
		m.URL,
		m.Method,
		m.ExpectedStatus,
		m.IntervalSeconds,
		m.IsActive,
		m.ID,
		m.UserID,
	).Scan(&m.UpdatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("failed to update monitor: %w", err)
	}

	return nil
}

func (r *postgresRepository) Delete(ctx context.Context, id, userID string) error {
	query := `DELETE FROM monitors WHERE id = $1 AND user_id = $2`
	res, err := r.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete monitor: %w", err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}

	return nil
}
