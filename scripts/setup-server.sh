#!/bin/bash

# Eye-Dentity Server Setup Script
# This script sets up a fresh server for running Eye-Dentity

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

log_info "Starting Eye-Dentity server setup..."

# Update system
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install dependencies
log_info "Installing dependencies..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban \
    vim \
    htop

# Install Docker
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Add current user to docker group
    if [ -n "$SUDO_USER" ]; then
        usermod -aG docker $SUDO_USER
        log_info "Added $SUDO_USER to docker group"
    fi
else
    log_info "Docker is already installed"
fi

# Install Docker Compose
if ! docker compose version &> /dev/null; then
    log_info "Installing Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
else
    log_info "Docker Compose is already installed"
fi

# Setup firewall
log_info "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw status

# Setup fail2ban
log_info "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
log_info "Creating application directory..."
mkdir -p /opt/eyedentity
cd /opt/eyedentity

# Clone repository (if git credentials are set up)
log_warn "Repository cloning skipped. Please clone manually:"
log_info "  cd /opt/eyedentity"
log_info "  git clone YOUR_REPO_URL ."

# Create necessary directories
log_info "Creating necessary directories..."
mkdir -p logs uploads nginx/ssl

# Set permissions
if [ -n "$SUDO_USER" ]; then
    chown -R $SUDO_USER:$SUDO_USER /opt/eyedentity
    log_info "Set ownership to $SUDO_USER"
fi

# Install Certbot for SSL
log_info "Installing Certbot for SSL certificates..."
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

log_info "✅ Server setup completed!"
log_info ""
log_info "Next steps:"
log_info "1. Clone your repository to /opt/eyedentity"
log_info "2. Copy .env.production.example to .env.production and configure"
log_info "3. Obtain SSL certificate: certbot certonly --standalone -d api.eyedentity.com"
log_info "4. Run deployment: ./scripts/deploy.sh"
log_info ""
log_warn "Important: Log out and log back in for Docker group changes to take effect!"
