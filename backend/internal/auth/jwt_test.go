package auth

import (
	"testing"
)

func TestJWTGenerationAndValidation(t *testing.T) {
	secret := "test-secret-key-123"
	userID := "usr_12345"
	email := "test@pulsecheck.dev"
	plan := "free"

	token, err := GenerateToken(userID, email, plan, secret, 15)
	if err != nil {
		t.Fatalf("unexpected error generating token: %v", err)
	}

	claims, err := ValidateToken(token, secret)
	if err != nil {
		t.Fatalf("unexpected error validating token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("expected userID %s, got %s", userID, claims.UserID)
	}
	if claims.Email != email {
		t.Errorf("expected email %s, got %s", email, claims.Email)
	}
	if claims.Plan != plan {
		t.Errorf("expected plan %s, got %s", plan, claims.Plan)
	}

	// Validate with incorrect secret fails
	_, err = ValidateToken(token, "wrong-secret")
	if err == nil {
		t.Fatal("expected validation error with wrong secret, got nil")
	}
}
