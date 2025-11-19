#!/bin/bash

# Database Migration Script
# Runs Prisma migrations on your existing PostgreSQL database

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if .env.production exists
if [ ! -f .env.production ]; then
    log_error ".env.production file not found!"
    exit 1
fi

# Load environment
export $(cat .env.production | grep -v '^#' | xargs)

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL not set in .env.production"
    exit 1
fi

log_info "Database Migration for Eye-Dentity"
log_info "Database: ${DATABASE_URL%%\?*}"  # Show URL without query params
log_warn "This will apply migrations to your EXISTING PostgreSQL database"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Migration cancelled"
    exit 0
fi

cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm ci
fi

# Generate Prisma Client
log_info "Generating Prisma Client..."
npx prisma generate

# Show migration status
log_info "Current migration status:"
npx prisma migrate status || true

# Run migrations
log_info "Applying migrations..."
npx prisma migrate deploy

# Seed database (optional)
if [ -f "prisma/seed.ts" ]; then
    read -p "Run database seed? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Seeding database..."
        npx prisma db seed
    fi
fi

log_info "✅ Database migration completed successfully!"
log_info ""
log_info "To view database:"
log_info "  npx prisma studio"
log_info ""
log_info "To create a new migration:"
log_info "  npx prisma migrate dev --name your_migration_name"
