package check

import (
	"context"
	"errors"
	"strings"
	"time"

	"pulsecheck/internal/monitor"
)

var (
	ErrMonitorNotFound = errors.New("monitor not found")
)

type Service interface {
	GetHistory(ctx context.Context, monitorID, userID, period string) (*HistoryResponse, error)
	GetPublicHistory(ctx context.Context, monitorID, period string) (*HistoryResponse, error)
}

type service struct {
	checkRepo   Repository
	monitorRepo monitor.Repository
}

func NewService(checkRepo Repository, monitorRepo monitor.Repository) Service {
	return &service{
		checkRepo:   checkRepo,
		monitorRepo: monitorRepo,
	}
}

func (s *service) GetHistory(ctx context.Context, monitorID, userID, period string) (*HistoryResponse, error) {
	// Enforce tenant ownership at the domain service layer
	_, err := s.monitorRepo.GetByID(ctx, monitorID, userID)
	if err != nil {
		return nil, ErrMonitorNotFound
	}

	return s.calculateHistory(ctx, monitorID, period)
}

func (s *service) GetPublicHistory(ctx context.Context, monitorID, period string) (*HistoryResponse, error) {
	_, err := s.monitorRepo.GetPublicByID(ctx, monitorID)
	if err != nil {
		return nil, ErrMonitorNotFound
	}

	return s.calculateHistory(ctx, monitorID, period)
}

func (s *service) calculateHistory(ctx context.Context, monitorID, period string) (*HistoryResponse, error) {
	since, normPeriod := parsePeriod(period)

	stats, err := s.checkRepo.GetUptimeStats(ctx, monitorID, since)
	if err != nil {
		return nil, err
	}

	recentChecks, err := s.checkRepo.ListRecentChecks(ctx, monitorID, 50)
	if err != nil {
		return nil, err
	}

	return &HistoryResponse{
		MonitorID:    monitorID,
		Period:       normPeriod,
		Uptime:       stats,
		RecentChecks: recentChecks,
	}, nil
}

func parsePeriod(p string) (time.Time, string) {
	switch strings.ToLower(strings.TrimSpace(p)) {
	case "24h":
		return time.Now().Add(-24 * time.Hour), "24h"
	case "7d":
		return time.Now().Add(-7 * 24 * time.Hour), "7d"
	case "30d":
		fallthrough
	default:
		return time.Now().Add(-30 * 24 * time.Hour), "30d"
	}
}
