package notification

import (
	"context"
	"fmt"
	"log"
	"net/smtp"
	"strings"
	"time"
)

type Service interface {
	SendDowntimeAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, reason string) error
	SendRecoveryAlert(ctx context.Context, recipientEmail, monitorName, targetURL string, statusCode int, responseTimeMs int) error
}

type smtpService struct {
	host      string
	port      int
	username  string
	password  string
	fromEmail string
}

func NewService(host string, port int, username, password, fromEmail string) Service {
	return &smtpService{
		host:      host,
		port:      port,
		username:  username,
		password:  password,
		fromEmail: fromEmail,
	}
}

func (s *smtpService) SendDowntimeAlert(
	ctx context.Context,
	recipientEmail string,
	monitorName string,
	targetURL string,
	statusCode int,
	reason string,
) error {
	recipientEmail = strings.TrimSpace(recipientEmail)
	if recipientEmail == "" {
		return fmt.Errorf("recipient email address cannot be empty")
	}

	// Fall back to console logging if SMTP settings are not provided
	if s.host == "" || s.username == "" {
		log.Printf("[NOTIFICATION FALLBACK] Downtime alert for '%s' (%s) -> recipient: %s. Detail: %s (status %d)\n",
			monitorName, targetURL, recipientEmail, reason, statusCode)
		return nil
	}

	subject := fmt.Sprintf("Alert: Monitor '%s' is DOWN", monitorName)
	timestamp := time.Now().UTC().Format(time.RFC1123)

	body := fmt.Sprintf(`From: %s
To: %s
Subject: %s
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
    .card { background: #1e293b; border-radius: 8px; padding: 24px; max-width: 560px; margin: 0 auto; border-left: 4px solid #ef4444; }
    h2 { color: #ef4444; margin-top: 0; font-size: 20px; }
    .badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; }
    .details { margin: 16px 0; line-height: 1.6; font-size: 14px; }
    .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Downtime Alert: Endpoint Offline</h2>
    <p>Your monitored resource has become unreachable or returned an unexpected response code.</p>
    <div class="details">
      <p><strong>Monitor:</strong> %s</p>
      <p><strong>Target URL:</strong> <a href="%s" style="color: #38bdf8;">%s</a></p>
      <p><strong>HTTP Status:</strong> <span class="badge">%d</span></p>
      <p><strong>Reason:</strong> %s</p>
      <p><strong>Timestamp:</strong> %s</p>
    </div>
    <div class="footer">
      This notification was automatically dispatched by PulseCheck Uptime Bot.
    </div>
  </div>
</body>
</html>`, s.fromEmail, recipientEmail, subject, monitorName, targetURL, targetURL, statusCode, reason, timestamp)

	auth := smtp.PlainAuth("", s.username, s.password, s.host)
	addr := fmt.Sprintf("%s:%d", s.host, s.port)

	// Send using standard library net/smtp to stay provider-agnostic
	err := smtp.SendMail(addr, auth, s.fromEmail, []string{recipientEmail}, []byte(body))
	if err != nil {
		log.Printf("[SMTP ERROR] Failed sending alert email to %s: %v\n", recipientEmail, err)
		return fmt.Errorf("failed to send smtp alert email: %w", err)
	}

	log.Printf("[NOTIFICATION SENT] Downtime alert delivered to %s for monitor '%s'\n", recipientEmail, monitorName)
	return nil
}

func (s *smtpService) SendRecoveryAlert(
	ctx context.Context,
	recipientEmail string,
	monitorName string,
	targetURL string,
	statusCode int,
	responseTimeMs int,
) error {
	recipientEmail = strings.TrimSpace(recipientEmail)
	if recipientEmail == "" {
		return fmt.Errorf("recipient email address cannot be empty")
	}

	// Fall back to console logging if SMTP settings are not provided
	if s.host == "" || s.username == "" {
		log.Printf("[NOTIFICATION FALLBACK] Recovery alert for '%s' (%s) -> recipient: %s. Status: %d (%dms)\n",
			monitorName, targetURL, recipientEmail, statusCode, responseTimeMs)
		return nil
	}

	subject := fmt.Sprintf("Resolved: Monitor '%s' is UP", monitorName)
	timestamp := time.Now().UTC().Format(time.RFC1123)

	body := fmt.Sprintf(`From: %s
To: %s
Subject: %s
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
    .card { background: #1e293b; border-radius: 8px; padding: 24px; max-width: 560px; margin: 0 auto; border-left: 4px solid #10b981; }
    h2 { color: #10b981; margin-top: 0; font-size: 20px; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; }
    .details { margin: 16px 0; line-height: 1.6; font-size: 14px; }
    .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Incident Resolved: Service Restored</h2>
    <p>Your monitored resource is back online and responding normally.</p>
    <div class="details">
      <p><strong>Monitor:</strong> %s</p>
      <p><strong>Target URL:</strong> <a href="%s" style="color: #38bdf8;">%s</a></p>
      <p><strong>HTTP Status:</strong> <span class="badge">%d OK</span></p>
      <p><strong>Response Latency:</strong> %dms</p>
      <p><strong>Timestamp:</strong> %s</p>
    </div>
    <div class="footer">
      This notification was automatically dispatched by PulseCheck Uptime Bot.
    </div>
  </div>
</body>
</html>`, s.fromEmail, recipientEmail, subject, monitorName, targetURL, targetURL, statusCode, responseTimeMs, timestamp)

	auth := smtp.PlainAuth("", s.username, s.password, s.host)
	addr := fmt.Sprintf("%s:%d", s.host, s.port)

	err := smtp.SendMail(addr, auth, s.fromEmail, []string{recipientEmail}, []byte(body))
	if err != nil {
		log.Printf("[SMTP ERROR] Failed sending recovery alert email to %s: %v\n", recipientEmail, err)
		return fmt.Errorf("failed to send smtp recovery email: %w", err)
	}

	log.Printf("[NOTIFICATION SENT] Recovery alert delivered to %s for monitor '%s'\n", recipientEmail, monitorName)
	return nil
}
