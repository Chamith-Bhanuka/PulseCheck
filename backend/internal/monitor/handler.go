package monitor

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
	// Protected monitor management routes
	mux.Handle("POST /api/monitors", authMiddleware(http.HandlerFunc(h.Create)))
	mux.Handle("GET /api/monitors", authMiddleware(http.HandlerFunc(h.List)))
	mux.Handle("GET /api/monitors/{id}", authMiddleware(http.HandlerFunc(h.Get)))
	mux.Handle("PUT /api/monitors/{id}", authMiddleware(http.HandlerFunc(h.Update)))
	mux.Handle("DELETE /api/monitors/{id}", authMiddleware(http.HandlerFunc(h.Delete)))

	// Public status endpoint (no authentication required)
	mux.HandleFunc("GET /api/status/{id}/public", h.GetPublic)
	mux.HandleFunc("GET /status/{id}/public", h.GetPublic)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	plan := auth.GetUserPlan(r.Context())

	var req CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	m, err := h.service.Create(r.Context(), userID, plan, req)
	if err != nil {
		if errors.Is(err, ErrPlanLimitExceeded) {
			respondJSON(w, http.StatusForbidden, map[string]string{"error": err.Error()})
			return
		}
		if errors.Is(err, ErrIntervalTooLow) || errors.Is(err, ErrInvalidURL) || errors.Is(err, ErrInvalidMethod) || errors.Is(err, ErrInvalidStatusCode) {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create monitor"})
		return
	}

	respondJSON(w, http.StatusCreated, m)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	monitors, err := h.service.List(r.Context(), userID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to list monitors"})
		return
	}

	respondJSON(w, http.StatusOK, monitors)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := r.PathValue("id")
	m, err := h.service.Get(r.Context(), id, userID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Monitor not found"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch monitor"})
		return
	}

	respondJSON(w, http.StatusOK, m)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	plan := auth.GetUserPlan(r.Context())

	id := r.PathValue("id")
	var req UpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	m, err := h.service.Update(r.Context(), id, userID, plan, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Monitor not found"})
			return
		}
		if errors.Is(err, ErrIntervalTooLow) || errors.Is(err, ErrInvalidURL) || errors.Is(err, ErrInvalidMethod) || errors.Is(err, ErrInvalidStatusCode) {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update monitor"})
		return
	}

	respondJSON(w, http.StatusOK, m)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	id := r.PathValue("id")
	if err := h.service.Delete(r.Context(), id, userID); err != nil {
		if errors.Is(err, ErrNotFound) {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Monitor not found"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete monitor"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) GetPublic(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	m, err := h.service.GetPublic(r.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			respondJSON(w, http.StatusNotFound, map[string]string{"error": "Monitor not found"})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch public status"})
		return
	}

	// Only expose non-sensitive public metadata
	publicData := map[string]interface{}{
		"id":         m.ID,
		"name":       m.Name,
		"url":        m.URL,
		"is_active":  m.IsActive,
		"created_at": m.CreatedAt,
	}

	respondJSON(w, http.StatusOK, publicData)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
