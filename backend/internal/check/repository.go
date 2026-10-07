package check

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

type Repository interface {
	SaveResult(ctx context.Context, res *Result) error
	GetLatestResult(ctx context.Context, monitorID string) (*Result, error)
	ListRecentChecks(ctx context.Context, monitorID string, limit int) ([]*Result, error)
	GetUptimeStats(ctx context.Context, monitorID string, since time.Time) (*UptimeStats, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) SaveResult(ctx context.Context, res *Result) error {
	query := `
		INSERT INTO checks (monitor_id, status_code, response_time_ms, success, error_message, checked_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		res.MonitorID,
		res.StatusCode,
		res.ResponseTimeMs,
		res.Success,
		res.ErrorMessage,
		res.CheckedAt,
	).Scan(&res.ID)
}

func (r *postgresRepository) GetLatestResult(ctx context.Context, monitorID string) (*Result, error) {
	query := `
		SELECT id, monitor_id, status_code, response_time_ms, success, error_message, checked_at
		FROM checks
		WHERE monitor_id = $1
		ORDER BY checked_at DESC
		LIMIT 1
	`

	var res Result
	err := r.db.QueryRowContext(ctx, query, monitorID).Scan(
		&res.ID,
		&res.MonitorID,
		&res.StatusCode,
		&res.ResponseTimeMs,
		&res.Success,
		&res.ErrorMessage,
		&res.CheckedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // No previous check exists yet
		}
		return nil, fmt.Errorf("failed to get latest check: %w", err)
	}

	return &res, nil
}

func (r *postgresRepository) ListRecentChecks(ctx context.Context, monitorID string, limit int) ([]*Result, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	query := `
		SELECT id, monitor_id, status_code, response_time_ms, success, error_message, checked_at
		FROM checks
		WHERE monitor_id = $1
		ORDER BY checked_at DESC
		LIMIT $2
	`

	rows, err := r.db.QueryContext(ctx, query, monitorID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query check results: %w", err)
	}
	defer rows.Close()

	results := make([]*Result, 0)
	for rows.Next() {
		var res Result
		if err := rows.Scan(
			&res.ID,
			&res.MonitorID,
			&res.StatusCode,
			&res.ResponseTimeMs,
			&res.Success,
			&res.ErrorMessage,
			&res.CheckedAt,
		); err != nil {
			return nil, fmt.Errorf("failed scanning check row: %w", err)
		}
		results = append(results, &res)
	}

	return results, rows.Err()
}

// GetUptimeStats performs database-level SQL aggregation over the requested time window
// rather than fetching thousands of rows into Go memory.
func (r *postgresRepository) GetUptimeStats(ctx context.Context, monitorID string, since time.Time) (*UptimeStats, error) {
	query := `
		SELECT 
			COUNT(*) AS total_checks,
			COALESCE(SUM(CASE WHEN success THEN 1 ELSE 0 END), 0) AS successful_checks,
			COALESCE(SUM(CASE WHEN NOT success THEN 1 ELSE 0 END), 0) AS failed_checks,
			COALESCE(AVG(response_time_ms), 0) AS avg_response_time_ms,
			COALESCE(
				ROUND(
					(SUM(CASE WHEN success THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(*), 0)) * 100.0,
					2
				),
				100.00
			) AS uptime_percentage
		FROM checks
		WHERE monitor_id = $1 AND checked_at >= $2
	`

	var stats UptimeStats
	err := r.db.QueryRowContext(ctx, query, monitorID, since).Scan(
		&stats.TotalChecks,
		&stats.SuccessfulChecks,
		&stats.FailedChecks,
		&stats.AvgResponseTimeMs,
		&stats.UptimePercentage,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to calculate uptime aggregation: %w", err)
	}

	return &stats, nil
}
