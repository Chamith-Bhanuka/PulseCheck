package check

import (
	"context"
	"log"
)

// Notifier abstracts delivery of downtime and recovery alerts across notification channels.
type Notifier interface {
	SendDowntimeAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, reason string) error
	SendRecoveryAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, responseTimeMs int) error
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

func (l *LoggingNotifier) SendRecoveryAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, responseTimeMs int) error {
	log.Printf("[RECOVERY] Monitor '%s' (%s) recovered! Status: %d (%dms). Recipient: %s\n",
		monitorName, targetURL, statusCode, responseTimeMs, recipientEmail)
	return nil
}
