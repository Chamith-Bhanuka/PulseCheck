package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pulsecheck/internal/auth"
	"pulsecheck/internal/billing"
	"pulsecheck/internal/check"
	"pulsecheck/internal/config"
	"pulsecheck/internal/database"
	"pulsecheck/internal/monitor"
	"pulsecheck/internal/notification"
	"pulsecheck/internal/user"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// 1. Establish database connection pool
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Printf("[DATABASE WARNING] Could not connect to database (%v). Waiting for local PostgreSQL...\n", err)
	} else {
		defer db.Close()
		log.Println("Database connection pool established")

		// 2. Run database migrations
		if err := database.Migrate(db); err != nil {
			log.Printf("[DATABASE WARNING] Migration failed: %v\n", err)
		}
	}

	// 3. Initialize domain repositories
	var userRepo user.Repository
	var monitorRepo monitor.Repository
	var checkRepo check.Repository
	if db != nil {
		userRepo = user.NewRepository(db)
		monitorRepo = monitor.NewRepository(db)
		checkRepo = check.NewRepository(db)
	}

	// 4. Initialize services
	notifyService := notification.NewService(
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUsername,
		cfg.SMTPPassword,
		cfg.SMTPFromEmail,
	)

	var userService user.Service
	var monitorService monitor.Service
	var checkService check.Service
	var billingService billing.Service
	var checkEngine *check.Engine

	if db != nil {
		userService = user.NewService(userRepo, cfg.JWTSecret, cfg.JWTExpiryMinutes)
		monitorService = monitor.NewService(monitorRepo)
		checkService = check.NewService(checkRepo, monitorRepo)
		billingService = billing.NewService(userRepo, cfg.StripeSecretKey, cfg.StripeWebhookSecret, cfg.StripePriceID, cfg.ClientOrigin)

		// 5. Initialize concurrent check engine (20 worker slots)
		checkEngine = check.NewEngine(checkRepo, monitorRepo, userRepo, notifyService, 20)
		if err := checkEngine.Start(); err != nil {
			log.Printf("[ENGINE WARNING] Could not start check engine loop: %v\n", err)
		} else {
			log.Println("Concurrent check engine started successfully")
		}
	}

	// 6. Router and Middlewares
	mux := http.NewServeMux()
	authMiddleware := auth.RequireAuth(cfg.JWTSecret)
	corsMiddleware := auth.CORS(cfg.ClientOrigin)

	// Health check routes
	healthHandler := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","timestamp":"` + time.Now().UTC().Format(time.RFC3339) + `"}`))
	}
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("GET /api/health", healthHandler)

	// Register domain routes if database is available
	if db != nil {
		userHandler := user.NewHandler(userService)
		userHandler.RegisterRoutes(mux, authMiddleware)

		monitorHandler := monitor.NewHandler(monitorService)
		monitorHandler.RegisterRoutes(mux, authMiddleware)

		checkHandler := check.NewHandler(checkService)
		checkHandler.RegisterRoutes(mux, authMiddleware)

		billingHandler := billing.NewHandler(billingService)
		billingHandler.RegisterRoutes(mux, authMiddleware)
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      corsMiddleware(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 7. Graceful shutdown handler
	shutdownErr := make(chan error, 1)
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutdown signal received. Stopping services...")

		// Stop background check engine workers first
		if checkEngine != nil {
			log.Println("Stopping check engine workers...")
			checkEngine.Stop()
		}

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()

		shutdownErr <- server.Shutdown(shutdownCtx)
	}()

	log.Printf("PulseCheck server listening on http://localhost:%d\n", cfg.Port)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("Server startup failed: %v", err)
	}

	if err := <-shutdownErr; err != nil {
		log.Printf("Graceful shutdown error: %v\n", err)
	} else {
		log.Println("PulseCheck server stopped cleanly")
	}
}
