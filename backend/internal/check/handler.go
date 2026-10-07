package check

import (
	"encoding/json"
	"errors"
	"net/http"

	"pulsecheck/internal/auth"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux, authMiddleware func(http.Handler) http.Handler) {
	mux.Handle("GET /api/monitors/{id}/history", authMiddleware(http.HandlerFunc(h.GetHistory)))
	mux.HandleFunc("GET /api/status/{id}/public/history", h.GetPublicHistory)
}

func (h *Handler) GetHistory(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	monitorID := r.PathValue("id")
	period := r.URL.Query().Get("period")

	history, err := h.service.GetHistory(r.Context(), monitorID, userID, period)
	if err != nil {
		if errors.Is(err, ErrMonitorNotFound) {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Monitor not found"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch uptime history"})
		return
	}

	respondJSON(w, http.StatusOK, history)
}

func (h *Handler) GetPublicHistory(w http.ResponseWriter, r *http.Request) {
	monitorID := r.PathValue("id")
	period := r.URL.Query().Get("period")

	history, err := h.service.GetPublicHistory(r.Context(), monitorID, period)
	if err != nil {
		if errors.Is(err, ErrMonitorNotFound) {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Monitor not found"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch public uptime history"})
		return
	}

	respondJSON(w, http.StatusOK, history)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
