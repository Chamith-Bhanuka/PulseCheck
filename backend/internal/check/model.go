package check

import "time"

type Result struct {
	ID             string    `json:"id"`
	MonitorID      string    `json:"monitor_id"`
	StatusCode     int       `json:"status_code"`
	ResponseTimeMs int       `json:"response_time_ms"`
	Success        bool      `json:"success"`
	ErrorMessage   *string   `json:"error_message,omitempty"`
	CheckedAt      time.Time `json:"checked_at"`
}

type UptimeStats struct {
	UptimePercentage  float64 `json:"uptime_percentage"`
	TotalChecks       int     `json:"total_checks"`
	SuccessfulChecks  int     `json:"successful_checks"`
	FailedChecks      int     `json:"failed_checks"`
	AvgResponseTimeMs float64 `json:"avg_response_time_ms"`
}

type HistoryResponse struct {
	MonitorID    string       `json:"monitor_id"`
	Period       string       `json:"period"`
	Uptime       *UptimeStats `json:"uptime"`
	RecentChecks []*Result    `json:"recent_checks"`
}
