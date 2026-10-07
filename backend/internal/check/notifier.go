package check

import (
	"context"
	"log"
)

// Notifier abstracts delivery of downtime alerts across notification channels.
type Notifier interface {
	SendDowntimeAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, reason string) error
}

// LoggingNotifier prints alert dispatches to stdout for local development or fallback.
type LoggingNotifier struct{}

func NewLoggingNotifier() *LoggingNotifier {
	return &LoggingNotifier{}
}

func (l *LoggingNotifier) SendDowntimeAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, reason string) error {
	log.Printf("[ALERT] Monitor '%s' (%s) reported down! Status: %d, Detail: %s. Recipient: %s\n",
		monitorName, targetURL, statusCode, reason, recipientEmail)
	return nil
}
