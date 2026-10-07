package monitor

import "time"

const (
	FreeMaxMonitors     = 5
	FreeMinIntervalSec  = 300 // 5 minutes
	PaidMaxMonitors     = 50
	PaidMinIntervalSec  = 30  // 30 seconds
)

type Monitor struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	Name            string    `json:"name"`
	URL             string    `json:"url"`
	Method          string    `json:"method"`
	ExpectedStatus  int       `json:"expected_status"`
	IntervalSeconds int       `json:"interval_seconds"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CreateRequest struct {
	Name            string `json:"name"`
	URL             string `json:"url"`
	Method          string `json:"method"`
	ExpectedStatus  int    `json:"expected_status"`
	IntervalSeconds int    `json:"interval_seconds"`
}

type UpdateRequest struct {
	Name            *string `json:"name"`
	URL             *string `json:"url"`
	Method          *string `json:"method"`
	ExpectedStatus  *int    `json:"expected_status"`
	IntervalSeconds *int    `json:"interval_seconds"`
	IsActive        *bool   `json:"is_active"`
}
