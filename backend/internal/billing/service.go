package billing

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/checkout/session"
	"github.com/stripe/stripe-go/v78/webhook"

	"pulsecheck/internal/user"
)

type ContextKey string

const RequestOriginKey ContextKey = "request_origin"

var (
	ErrInvalidWebhookSignature = errors.New("invalid webhook signature")
	ErrMissingPriceID           = errors.New("stripe price id not configured")
)

type Service interface {
	CreateCheckoutSession(ctx context.Context, userID, userEmail string) (string, error)
	HandleWebhook(ctx context.Context, payload []byte, sigHeader string) error
}

type service struct {
	userRepo      user.Repository
	secretKey     string
	webhookSecret string
	priceID       string
	clientOrigin  string
}

func NewService(
	userRepo user.Repository,
	secretKey string,
	webhookSecret string,
	priceID string,
	clientOrigin string,
) Service {
	// Initialize Stripe API credentials globally for the SDK
	stripe.Key = secretKey

	return &service{
		userRepo:      userRepo,
		secretKey:     secretKey,
		webhookSecret: webhookSecret,
		priceID:       priceID,
		clientOrigin:  clientOrigin,
	}
}

func (s *service) CreateCheckoutSession(ctx context.Context, userID, userEmail string) (string, error) {
	if s.priceID == "" {
		return "", ErrMissingPriceID
	}

	origin := strings.TrimRight(s.clientOrigin, "/")
	if reqOrigin, ok := ctx.Value(RequestOriginKey).(string); ok && reqOrigin != "" && strings.HasPrefix(reqOrigin, "http") {
		origin = strings.TrimRight(reqOrigin, "/")
	} else if origin == "" || origin == "*" || !strings.HasPrefix(origin, "http") {
		origin = "https://pulsecheck-frontend-uybup6m5va-uc.a.run.app"
	}

	successURL := fmt.Sprintf("%s/dashboard?billing=success", origin)
	cancelURL := fmt.Sprintf("%s/dashboard?billing=cancelled", origin)

	params := &stripe.CheckoutSessionParams{
		Mode:              stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		CustomerEmail:     stripe.String(userEmail),
		SuccessURL:        stripe.String(successURL),
		CancelURL:         stripe.String(cancelURL),
		ClientReferenceID: stripe.String(userID),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(s.priceID),
				Quantity: stripe.Int64(1),
			},
		},
		Metadata: map[string]string{
			"user_id": userID,
		},
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Metadata: map[string]string{
				"user_id": userID,
			},
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create stripe checkout session: %w", err)
	}

	return sess.URL, nil
}

func (s *service) HandleWebhook(ctx context.Context, payload []byte, sigHeader string) error {
	event, err := webhook.ConstructEventWithOptions(
		payload,
		sigHeader,
		s.webhookSecret,
		webhook.ConstructEventOptions{
			IgnoreAPIVersionMismatch: true,
		},
	)
	if err != nil {
		log.Printf("[STRIPE WEBHOOK ERROR] Verification failed: %v", err)
		return fmt.Errorf("%w: %v", ErrInvalidWebhookSignature, err)
	}

	log.Printf("[STRIPE WEBHOOK] Received event: %s (id: %s)", event.Type, event.ID)

	switch event.Type {
	case "checkout.session.completed":
		var sess stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
			log.Printf("[STRIPE WEBHOOK ERROR] Failed to parse checkout session event data: %v", err)
			return fmt.Errorf("failed to parse checkout session event data: %w", err)
		}

		userID, ok := sess.Metadata["user_id"]
		if !ok || userID == "" {
			if sess.ClientReferenceID != "" {
				userID = sess.ClientReferenceID
			} else {
				log.Printf("[STRIPE WEBHOOK ERROR] Missing user_id in checkout.session.completed metadata and ClientReferenceID")
				return nil
			}
		}

		var customerID *string
		if sess.Customer != nil && sess.Customer.ID != "" {
			customerID = &sess.Customer.ID
		}

		var subscriptionID *string
		if sess.Subscription != nil && sess.Subscription.ID != "" {
			subscriptionID = &sess.Subscription.ID
		}

		if err := s.userRepo.UpdatePlan(ctx, userID, user.PlanPaid, customerID, subscriptionID); err != nil {
			log.Printf("[STRIPE WEBHOOK ERROR] Failed to upgrade user plan in DB: %v", err)
			return fmt.Errorf("failed to upgrade user plan after checkout: %w", err)
		}
		log.Printf("[STRIPE WEBHOOK] User %s upgraded to paid plan successfully\n", userID)

	case "customer.subscription.deleted":
		var sub stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
			return fmt.Errorf("failed to parse subscription cancellation event data: %w", err)
		}

		customerID := sub.Customer.ID
		u, err := s.userRepo.GetByStripeCustomerID(ctx, customerID)
		if err != nil {
			log.Printf("[STRIPE] No local user matching customer id %s on cancellation: %v\n", customerID, err)
			return nil
		}

		if err := s.userRepo.UpdatePlan(ctx, u.ID, user.PlanFree, nil, nil); err != nil {
			return fmt.Errorf("failed to downgrade user plan on subscription cancellation: %w", err)
		}
		log.Printf("[STRIPE] User %s downgraded to free plan on subscription termination\n", u.ID)

	default:
		// Unhandled event types are acknowledged safely without error
		log.Printf("[STRIPE] Received unhandled event type: %s\n", event.Type)
	}

	return nil
}
