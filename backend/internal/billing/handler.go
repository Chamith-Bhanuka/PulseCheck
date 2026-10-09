package billing

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"

	"pulsecheck/internal/auth"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux, authMiddleware func(http.Handler) http.Handler) {
	mux.Handle("POST /api/billing/checkout", authMiddleware(http.HandlerFunc(h.CreateCheckout)))
	mux.HandleFunc("POST /api/billing/webhook", h.HandleWebhook)
}

func (h *Handler) CreateCheckout(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	userEmail := auth.GetUserEmail(r.Context())

	ctx := r.Context()
	origin := r.Header.Get("Origin")
	if origin == "" {
		referer := r.Header.Get("Referer")
		if referer != "" {
			if u, err := url.Parse(referer); err == nil && u.Host != "" {
				origin = fmt.Sprintf("%s://%s", u.Scheme, u.Host)
			}
		}
	}
	if origin != "" {
		ctx = context.WithValue(ctx, RequestOriginKey, origin)
	}

	checkoutURL, err := h.service.CreateCheckoutSession(ctx, userID, userEmail)
	if err != nil {
		if errors.Is(err, ErrMissingPriceID) {
			respondJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "Billing is currently unavailable"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to initiate checkout session: " + err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"checkout_url": checkoutURL})
}

func (h *Handler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	const maxBodyBytes = int64(65536)
	payload, err := io.ReadAll(io.LimitReader(r.Body, maxBodyBytes))
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Failed to read request body"})
		return
	}

	sigHeader := r.Header.Get("Stripe-Signature")
	if sigHeader == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Missing Stripe-Signature header"})
		return
	}

	if err := h.service.HandleWebhook(r.Context(), payload, sigHeader); err != nil {
		log.Printf("[STRIPE WEBHOOK HANDLER ERROR] %v", err)
		if errors.Is(err, ErrInvalidWebhookSignature) {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid signature"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to process webhook"})
		return
	}

	w.WriteHeader(http.StatusOK)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
