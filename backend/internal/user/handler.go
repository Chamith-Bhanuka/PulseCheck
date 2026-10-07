package user

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
	mux.HandleFunc("POST /api/auth/register", h.Register)
	mux.HandleFunc("POST /api/auth/login", h.Login)
	mux.Handle("GET /api/auth/me", authMiddleware(http.HandlerFunc(h.Me)))
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	res, err := h.service.Register(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, ErrUserAlreadyExists) {
			respondJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
			return
		}
		if errors.Is(err, ErrInvalidEmail) || errors.Is(err, ErrWeakPassword) {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
		return
	}

	respondJSON(w, http.StatusCreated, res)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	res, err := h.service.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			respondJSON(w, http.StatusUnauthorized, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to authenticate"})
		return
	}

	respondJSON(w, http.StatusOK, res)
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.GetUserID(r.Context())
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	profile, err := h.service.GetProfile(r.Context(), userID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "User profile not found"})
		return
	}

	respondJSON(w, http.StatusOK, profile)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
