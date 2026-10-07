package config

import (
	"bufio"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port             int
	ClientOrigin     string
	DatabaseURL      string
	JWTSecret        string
	JWTExpiryMinutes int

	// Stripe configuration
	StripeSecretKey     string
	StripeWebhookSecret string
	StripePriceID       string

	// SMTP configuration
	SMTPHost      string
	SMTPPort      int
	SMTPUsername  string
	SMTPPassword  string
	SMTPFromEmail string
}

// Load reads settings from environment variables, falling back to safe defaults.
// It also checks for a local .env file in the current working directory if present.
func Load() (*Config, error) {
	loadDotEnv(".env")

	cfg := &Config{
		Port:             getEnvAsInt("PORT", 8080),
		ClientOrigin:     getEnv("CLIENT_ORIGIN", "http://localhost:5173"),
		DatabaseURL:      getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/pulsecheck?sslmode=disable"),
		JWTSecret:        getEnv("JWT_SECRET", "pulsecheck-development-secret-key-change-in-production"),
		JWTExpiryMinutes: getEnvAsInt("JWT_EXPIRY_MINUTES", 15),

		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		StripePriceID:       getEnv("STRIPE_PRICE_ID", ""),

		SMTPHost:      getEnv("SMTP_HOST", "sandbox.smtp.mailtrap.io"),
		SMTPPort:      getEnvAsInt("SMTP_PORT", 2525),
		SMTPUsername:  getEnv("SMTP_USERNAME", ""),
		SMTPPassword:  getEnv("SMTP_PASSWORD", ""),
		SMTPFromEmail: getEnv("SMTP_FROM_EMAIL", "alerts@pulsecheck.dev"),
	}

	return cfg, nil
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvAsInt(key string, defaultVal int) int {
	valStr := os.Getenv(key)
	if valStr == "" {
		return defaultVal
	}
	val, err := strconv.Atoi(valStr)
	if err != nil {
		return defaultVal
	}
	return val
}

// loadDotEnv parses key=val pairs from a local file without requiring third-party packages.
func loadDotEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			k := strings.TrimSpace(parts[0])
			v := strings.TrimSpace(parts[1])
			// Strip matching quotes if provided
			v = strings.Trim(v, `"'`)
			if os.Getenv(k) == "" {
				os.Setenv(k, v)
			}
		}
	}
}
