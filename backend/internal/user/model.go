package user

import "time"

// Plan types supported in PulseCheck
const (
	PlanFree = "free"
	PlanPaid = "paid"
)

type User struct {
	ID                   string    `json:"id"`
	Email                string    `json:"email"`
	PasswordHash         string    `json:"-"`
	Plan                 string    `json:"plan"`
	StripeCustomerID     *string   `json:"stripe_customer_id,omitempty"`
	StripeSubscriptionID *string   `json:"stripe_subscription_id,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
	Token                string    `json:"token,omitempty"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}
