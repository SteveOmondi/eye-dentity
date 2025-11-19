# Eye-Dentity Deployment Guide

Complete guide for deploying the Eye-Dentity platform to production using your existing PostgreSQL database.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Manual Deployment](#manual-deployment)
- [Database Migrations](#database-migrations)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

1. **Existing PostgreSQL Database** (v14+)
   - You already have this ✅
   - Will need connection credentials

2. **DigitalOcean Droplet** or **Server**
   - 2-4 vCPUs, 4-8 GB RAM
   - Ubuntu 20.04/22.04 LTS

3. **Domain Name**
   - Configured DNS pointing to your server

4. **Third-Party Services**
   - Stripe account (for payments)
   - Anthropic API key (for AI)
   - AWS S3 or compatible storage

### Required Credentials

Gather these before starting:
- PostgreSQL connection string
- Stripe API keys
- Anthropic API key
- AWS S3 credentials
- (Optional) Marketing platform credentials

---

## Quick Start

### Option 1: Automated GitHub Actions Deployment (Recommended)

```bash
# 1. Fork or clone this repository

# 2. Set up GitHub Secrets (see CI/CD section below)

# 3. Push to main branch - automatic deployment!
git push origin main
```

### Option 2: Manual Deployment

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Run server setup
sudo bash <(curl -s https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup-server.sh)

# 3. Clone repository
cd /opt/eyedentity
git clone YOUR_REPO_URL .

# 4. Configure environment
cp .env.production.example .env.production
nano .env.production  # Fill in your credentials

# 5. Run migrations on your existing database
./scripts/migrate-db.sh

# 6. Deploy
./scripts/deploy.sh
```

---

## Detailed Setup

### Step 1: Server Setup

SSH into your server and run the setup script:

```bash
# As root or with sudo
sudo bash scripts/setup-server.sh
```

This script installs:
- Docker & Docker Compose
- Nginx (optional reverse proxy)
- UFW firewall
- Fail2ban (security)
- Certbot (SSL certificates)

### Step 2: Configure Environment Variables

Create your production environment file:

```bash
cp .env.production.example .env.production
```

**Critical Variables for Existing Database:**

```bash
# Your Existing PostgreSQL Database
DATABASE_URL="postgresql://your_user:your_password@your_db_host:5432/eyedentity?schema=public"

# If your PostgreSQL is on the same server:
DATABASE_URL="postgresql://username:password@localhost:5432/eyedentity?schema=public"

# If your PostgreSQL is in a Docker network:
DATABASE_URL="postgresql://username:password@postgres:5432/eyedentity?schema=public"

# If your PostgreSQL is on a managed service (e.g., DigitalOcean):
DATABASE_URL="postgresql://doadmin:password@db-postgresql-nyc3-12345-do-user-123456-0.b.db.ondigitalocean.com:25060/eyedentity?sslmode=require"
```

Fill in all other required values from `.env.production.example`.

### Step 3: SSL Certificate

Obtain SSL certificate for HTTPS:

```bash
# Stop any running web servers
sudo systemctl stop nginx

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d api.eyedentity.com

# Certificates will be in:
# /etc/letsencrypt/live/api.eyedentity.com/fullchain.pem
# /etc/letsencrypt/live/api.eyedentity.com/privkey.pem

# Copy to project directory
sudo cp /etc/letsencrypt/live/api.eyedentity.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.eyedentity.com/privkey.pem nginx/ssl/
```

### Step 4: Run Database Migrations

Apply database schema to your existing PostgreSQL:

```bash
./scripts/migrate-db.sh
```

This will:
1. Generate Prisma Client
2. Show current migration status
3. Apply pending migrations to your database
4. Optionally seed initial data

**⚠️ Important:** This modifies your existing database. Make sure you have a backup!

### Step 5: Deploy

Run the deployment script:

```bash
./scripts/deploy.sh
```

This will:
1. Pull latest code
2. Build Docker images
3. Run migrations
4. Start services
5. Perform health check

---

## CI/CD with GitHub Actions

### Setup GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

#### Server Access
```
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=your-ssh-username
PRODUCTION_SSH_KEY=<paste your private SSH key>
PRODUCTION_PORT=22
```

#### Optional: Staging Server
```
STAGING_HOST=staging-server-ip
STAGING_USER=staging-username
STAGING_SSH_KEY=<staging SSH key>
```

### Generate SSH Key for CI/CD

On your local machine:

```bash
# Generate dedicated key for CI/CD
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server

# Copy private key content for GitHub secret
cat ~/.ssh/github_actions
# Copy the entire output including -----BEGIN/END lines-----
```

### Workflow Triggers

The CI/CD pipeline triggers on:

- **Push to `main`** → Deploys to production
- **Push to `develop`** → Deploys to staging
- **Pull Requests** → Runs tests only

### Deployment Environments

Configure GitHub environments:

1. Go to Settings → Environments
2. Create `production` environment
3. (Optional) Add protection rules:
   - Required reviewers
   - Wait timer
   - Branch restrictions

---

## Manual Deployment

If you prefer manual deployment without CI/CD:

### Build and Deploy

```bash
# Pull latest changes
git pull origin main

# Build Docker image
docker build -t eyedentity-api:latest ./backend

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Using Pre-built Images

If using GitHub Container Registry:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull latest image
docker pull ghcr.io/YOUR_USERNAME/eye-dentity:latest

# Start with pulled image
docker-compose -f docker-compose.prod.yml up -d
```

---

## Database Migrations

### Check Migration Status

```bash
cd backend
npx prisma migrate status
```

### Apply Migrations

```bash
# Using script
./scripts/migrate-db.sh

# Or manually
cd backend
npx prisma migrate deploy
```

### Create New Migration (Development)

```bash
cd backend

# Make schema changes in prisma/schema.prisma

# Generate migration
npx prisma migrate dev --name add_new_feature

# Commit migration files
git add prisma/migrations
git commit -m "Add new database migration"
```

### Rollback Migration

Prisma doesn't support rollback directly. To revert:

1. Create a new migration that undoes the changes
2. Or restore from database backup

---

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Health Checks

```bash
# API health
curl https://api.eyedentity.com/health

# System health (admin only)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://api.eyedentity.com/api/admin/health/status
```

### Resource Usage

```bash
# Docker stats
docker stats

# Disk usage
docker system df

# Clean up unused images
docker system prune -a
```

### Database Backups

```bash
# Backup PostgreSQL
pg_dump -h your_db_host -U your_user -d eyedentity > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h your_db_host -U your_user -d eyedentity < backup_20240115.sql
```

### Update SSL Certificate

```bash
# Renew certificate (automatic with certbot)
sudo certbot renew

# Or force renewal
sudo certbot renew --force-renewal

# Restart nginx to use new certificate
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# 1. DATABASE_URL incorrect
# 2. Port already in use
# 3. Missing environment variables
```

### Database Connection Issues

```bash
# Test connection from container
docker-compose -f docker-compose.prod.yml run --rm backend sh
npx prisma db pull  # This will test the connection

# Check if PostgreSQL allows external connections:
# - pg_hba.conf: Add your server IP
# - postgresql.conf: listen_addresses = '*'
```

### Migration Failures

```bash
# Check migration status
npx prisma migrate status

# If stuck, mark as applied (CAREFUL!)
npx prisma migrate resolve --applied MIGRATION_NAME

# Or roll forward
npx prisma migrate resolve --rolled-back MIGRATION_NAME
npx prisma migrate deploy
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Or
sudo netstat -tulpn | grep :3000

# Kill process
sudo kill -9 PID
```

### SSL Certificate Issues

```bash
# Test SSL
openssl s_client -connect api.eyedentity.com:443

# Check certificate expiry
echo | openssl s_client -servername api.eyedentity.com -connect api.eyedentity.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Clean logs
truncate -s 0 logs/*.log
```

---

## Environment-Specific Tips

### DigitalOcean Droplet

If deploying to DigitalOcean Droplet:

1. **Use Managed PostgreSQL** (recommended)
   - Create database in DigitalOcean
   - Get connection string from control panel
   - Use in DATABASE_URL

2. **Use Spaces for S3**
   - Create a Space
   - Generate API keys
   - Compatible with AWS S3 SDK

### Kubernetes Cluster

If deploying to Kubernetes, use the manifests in `.github/workflows/k8s/` (to be created).

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Enable firewall (UFW)
- [ ] Install fail2ban
- [ ] Use HTTPS only
- [ ] Restrict database access
- [ ] Set up regular backups
- [ ] Monitor system logs
- [ ] Keep system updated
- [ ] Use environment variables for secrets

---

## Support

For issues or questions:
- Create an issue on GitHub
- Check system health: `/api/admin/health/status`
- Review logs: `docker-compose logs`

---

## Quick Reference

```bash
# Deploy
./scripts/deploy.sh

# Migrate database
./scripts/migrate-db.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart service
docker-compose -f docker-compose.prod.yml restart backend

# Stop all
docker-compose -f docker-compose.prod.yml down

# Health check
curl http://localhost:3000/health
```

---

**Last Updated:** January 2025
