package notification

import (
	"context"
	"testing"
)

func TestNotificationService_ValidationAndFallback(t *testing.T) {
	// Empty recipient rejected
	svc := NewService("sandbox.smtp.mailtrap.io", 2525, "", "", "alerts@pulsecheck.dev")
	err := svc.SendDowntimeAlert(context.Background(), "", "API", "https://api.test", 500, "error")
	if err == nil {
		t.Fatal("expected error on empty recipient email, got nil")
	}

	// Fallback to log when host/username is empty (does not error)
	fallbackSvc := NewService("", 2525, "", "", "alerts@pulsecheck.dev")
	err = fallbackSvc.SendDowntimeAlert(context.Background(), "user@example.com", "API", "https://api.test", 500, "error")
	if err != nil {
		t.Fatalf("expected fallback not to return error, got: %v", err)
	}
}
