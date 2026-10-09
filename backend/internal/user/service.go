package user

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"pulsecheck/internal/auth"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidEmail       = errors.New("invalid email address format")
	ErrWeakPassword       = errors.New("password must be at least 8 characters long")
)

type Service interface {
	Register(ctx context.Context, email, password string) (*AuthResponse, error)
	Login(ctx context.Context, email, password string) (*AuthResponse, error)
	GetProfile(ctx context.Context, id string) (*User, error)
}

type service struct {
	repo             Repository
	jwtSecret        string
	jwtExpiryMinutes int
}

func NewService(repo Repository, jwtSecret string, jwtExpiryMinutes int) Service {
	return &service{
		repo:             repo,
		jwtSecret:        jwtSecret,
		jwtExpiryMinutes: jwtExpiryMinutes,
	}
}

func (s *service) Register(ctx context.Context, email, password string) (*AuthResponse, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if err := validateEmail(email); err != nil {
		return nil, err
	}
	if len(password) < 8 {
		return nil, ErrWeakPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	newUser := &User{
		Email:        email,
		PasswordHash: string(hash),
		Plan:         PlanFree,
	}

	if err := s.repo.Create(ctx, newUser); err != nil {
		return nil, err
	}

	token, err := auth.GenerateToken(newUser.ID, newUser.Email, newUser.Plan, s.jwtSecret, s.jwtExpiryMinutes)
	if err != nil {
		return nil, fmt.Errorf("failed to generate auth token: %w", err)
	}

	return &AuthResponse{
		Token: token,
		User:  newUser,
	}, nil
}

func (s *service) Login(ctx context.Context, email, password string) (*AuthResponse, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	u, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := auth.GenerateToken(u.ID, u.Email, u.Plan, s.jwtSecret, s.jwtExpiryMinutes)
	if err != nil {
		return nil, fmt.Errorf("failed to generate auth token: %w", err)
	}

	return &AuthResponse{
		Token: token,
		User:  u,
	}, nil
}

func (s *service) GetProfile(ctx context.Context, id string) (*User, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if s.jwtSecret != "" {
		token, err := auth.GenerateToken(u.ID, u.Email, u.Plan, s.jwtSecret, s.jwtExpiryMinutes)
		if err == nil {
			u.Token = token
		}
	}

	return u, nil
}

func validateEmail(email string) error {
	if email == "" {
		return ErrInvalidEmail
	}
	_, err := mail.ParseAddress(email)
	if err != nil {
		return ErrInvalidEmail
	}
	return nil
}
