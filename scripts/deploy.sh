#!/bin/bash

# Eye-Dentity Deployment Script
# This script deploys the Eye-Dentity platform to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root. Use a regular user with sudo privileges."
   exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    log_error ".env.production file not found!"
    log_info "Copy .env.production.example to .env.production and fill in your values."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

log_info "Starting Eye-Dentity deployment..."

# Pull latest code
log_info "Pulling latest code from git..."
git pull origin main

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Determine docker-compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

log_info "Using Docker Compose command: $DOCKER_COMPOSE"

# Build Docker images
log_info "Building Docker images..."
$DOCKER_COMPOSE -f docker-compose.prod.yml build --no-cache

# Stop existing containers
log_info "Stopping existing containers..."
$DOCKER_COMPOSE -f docker-compose.prod.yml down

# Run database migrations
log_info "Running database migrations..."
$DOCKER_COMPOSE -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Start services
log_info "Starting services..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 15

# Health check
log_info "Performing health check..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log_info "✅ Health check passed!"
else
    log_error "❌ Health check failed!"
    log_info "Checking container logs..."
    $DOCKER_COMPOSE -f docker-compose.prod.yml logs backend
    exit 1
fi

# Show running containers
log_info "Running containers:"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps

# Show logs
log_info "Recent logs:"
$DOCKER_COMPOSE -f docker-compose.prod.yml logs --tail=50

log_info "✅ Deployment completed successfully!"
log_info "API is running at: ${BACKEND_URL}"
log_info ""
log_info "To view logs: $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
log_info "To stop: $DOCKER_COMPOSE -f docker-compose.prod.yml down"
log_info "To restart: $DOCKER_COMPOSE -f docker-compose.prod.yml restart"
