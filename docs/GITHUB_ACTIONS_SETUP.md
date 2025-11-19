# GitHub Actions CI/CD Setup Guide

Step-by-step guide to set up automated deployments with GitHub Actions for Eye-Dentity.

## Overview

The CI/CD pipeline automatically:
- ✅ Runs tests on every push/PR
- ✅ Builds Docker images
- ✅ Deploys to staging (develop branch)
- ✅ Deploys to production (main branch)

## Setup Steps

### 1. Prepare SSH Access

#### On Your Local Machine

Generate an SSH key specifically for GitHub Actions:

```bash
# Generate dedicated key
ssh-keygen -t ed25519 -C "github-actions-eyedentity" -f ~/.ssh/github_actions_eyedentity

# This creates two files:
# ~/.ssh/github_actions_eyedentity (private key - for GitHub)
# ~/.ssh/github_actions_eyedentity.pub (public key - for server)
```

#### On Your Production Server

Add the public key to authorized_keys:

```bash
# SSH into your server
ssh your-user@your-server-ip

# Add the public key
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Or use ssh-copy-id:

```bash
# From your local machine
ssh-copy-id -i ~/.ssh/github_actions_eyedentity.pub your-user@your-server-ip
```

Test the connection:

```bash
ssh -i ~/.ssh/github_actions_eyedentity your-user@your-server-ip
```

### 2. Configure GitHub Secrets

Go to your repository on GitHub:
1. Click **Settings** tab
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add the following secrets:

#### Required Secrets for Production

```
Name: PRODUCTION_HOST
Value: your-server-ip-or-domain.com

Name: PRODUCTION_USER
Value: your-ssh-username

Name: PRODUCTION_SSH_KEY
Value: <paste entire private key including -----BEGIN/END lines>

Name: PRODUCTION_PORT
Value: 22 (or your custom SSH port)
```

To get your private key content:

```bash
cat ~/.ssh/github_actions_eyedentity
# Copy the ENTIRE output including the BEGIN/END lines
```

#### Optional: Staging Server Secrets

If you have a staging server:

```
STAGING_HOST=staging.yourdomain.com
STAGING_USER=staging-user
STAGING_SSH_KEY=<staging private key>
STAGING_PORT=22
```

### 3. Prepare Your Server

#### Create Deployment Directory

```bash
# SSH into your server
ssh your-user@your-server-ip

# Create app directory
sudo mkdir -p /opt/eyedentity
sudo chown $USER:$USER /opt/eyedentity
cd /opt/eyedentity

# Clone your repository
git clone https://github.com/YOUR_USERNAME/eye-dentity.git .

# Or if already cloned, just pull
git pull origin main
```

#### Setup Environment File

```bash
cd /opt/eyedentity

# Copy example
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Important:** The `.env.production` file should contain:
- Your existing PostgreSQL connection string
- Stripe API keys
- Anthropic API key
- All other required credentials

### 4. Configure GitHub Environments (Optional but Recommended)

This adds manual approval for production deployments:

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it `production`
4. Configure protection rules:
   - ✅ Required reviewers (add yourself)
   - ✅ Wait timer: 5 minutes (prevents accidental deployments)
   - ✅ Deployment branches: Only `main` branch

Do the same for `staging` environment if needed.

### 5. Test the Pipeline

#### Test with Pull Request

```bash
# Create a feature branch
git checkout -b test-cicd

# Make a small change
echo "# Test CI/CD" >> README.md

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin test-cicd

# Create Pull Request on GitHub
# The CI will run tests automatically
```

#### Test Staging Deployment

```bash
# Merge to develop branch
git checkout develop
git merge test-cicd
git push origin develop

# This triggers staging deployment
# Check Actions tab to see progress
```

#### Test Production Deployment

```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main

# This triggers production deployment
# If you set up environment protection, you'll need to approve
```

## Workflow Overview

### Triggered Events

```yaml
on:
  push:
    branches: [main, develop, 'claude/**']
  pull_request:
    branches: [main, develop]
```

### Jobs

1. **test** - Runs on all events
   - Sets up Node.js
   - Installs dependencies
   - Runs linters
   - Runs tests
   - Builds application

2. **build-and-push** - Only on push to main/develop
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - Tags with branch name and commit SHA

3. **deploy-production** - Only on push to main
   - SSH into production server
   - Pulls latest code
   - Pulls latest Docker image
   - Runs database migrations
   - Restarts services
   - Performs health check

4. **deploy-staging** - Only on push to develop
   - Same as production but for staging server

## Monitoring Deployments

### View Workflow Runs

1. Go to **Actions** tab in GitHub
2. See all workflow runs
3. Click on a run to see details
4. Click on a job to see logs

### Check Deployment Status

After deployment completes, check:

```bash
# Health check
curl https://api.eyedentity.com/health

# View logs on server
ssh your-user@your-server
cd /opt/eyedentity
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### SSH Connection Failed

**Error:** `Permission denied (publickey)`

**Fix:**
1. Verify public key is in server's `~/.ssh/authorized_keys`
2. Check private key in GitHub secrets matches public key
3. Ensure correct username in `PRODUCTION_USER`
4. Test SSH manually with the same key

### Docker Login Failed

**Error:** `Login to Container Registry failed`

**Fix:**
- GitHub Actions uses `GITHUB_TOKEN` automatically
- No action needed, this should work by default
- If issues persist, create a Personal Access Token

### Deployment Script Failed

**Error:** `deploy.sh: not found` or `permission denied`

**Fix:**
```bash
# On your server
cd /opt/eyedentity
chmod +x scripts/*.sh
```

### Health Check Failed

**Error:** `Health check failed`

**Fix:**
```bash
# SSH into server
ssh your-user@your-server

# Check logs
cd /opt/eyedentity
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# - Database connection failed (check DATABASE_URL)
# - Missing environment variables
# - Port already in use
```

### Database Migration Failed

**Error:** `Prisma migrate deploy failed`

**Fix:**
```bash
# SSH into server
cd /opt/eyedentity

# Test database connection
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma db pull

# Check migration status
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate status

# Manual migration if needed
./scripts/migrate-db.sh
```

## Manual Deployment Fallback

If GitHub Actions fails, deploy manually:

```bash
# SSH into server
ssh your-user@your-server

# Navigate to app directory
cd /opt/eyedentity

# Pull latest code
git pull origin main

# Deploy
./scripts/deploy.sh
```

## Security Best Practices

1. **Rotate SSH Keys Regularly**
   - Generate new keys every 3-6 months
   - Update GitHub secrets

2. **Limit SSH Key Scope**
   - Use dedicated key for CI/CD
   - Consider using GitHub's deploy keys

3. **Protect Secrets**
   - Never commit `.env.production`
   - Use GitHub Secrets for all credentials
   - Enable secret scanning in repository settings

4. **Review Logs**
   - Regularly check workflow logs
   - Monitor failed deployments
   - Set up notifications for failures

5. **Use Environment Protection**
   - Require reviews for production
   - Add wait timers
   - Restrict to specific branches

## Advanced Configuration

### Custom Docker Registry

To use a private registry instead of ghcr.io:

```yaml
# In .github/workflows/ci-cd.yml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: registry.your-domain.com
    username: ${{ secrets.REGISTRY_USERNAME }}
    password: ${{ secrets.REGISTRY_PASSWORD }}
```

### Slack Notifications

Add Slack notifications for deployments:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to production ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Rollback on Failure

Add automatic rollback:

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    docker-compose -f docker-compose.prod.yml down
    git checkout HEAD~1
    ./scripts/deploy.sh
```

## Workflow Customization

Edit `.github/workflows/ci-cd.yml` to customize:

- Add more test steps
- Change deployment conditions
- Add additional environments
- Integrate with other services
- Add performance tests
- Configure notifications

## Support

If you encounter issues:

1. Check the Actions tab for detailed logs
2. Review this guide
3. Check server logs: `docker-compose logs`
4. Verify all secrets are correctly set
5. Test SSH connection manually

---

**Next Steps:**
- ✅ Set up GitHub secrets
- ✅ Configure environments
- ✅ Test with a small change
- ✅ Monitor your first deployment!
