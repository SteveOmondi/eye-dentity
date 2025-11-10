# Eye-Dentity: AI Website Builder Platform

![CI/CD](https://github.com/SteveOmondi/eye-dentity/workflows/CI%2FCD%20Pipeline/badge.svg)

> Fully automated, AI-powered platform that enables professionals and small businesses to create, deploy, and market websites with zero manual intervention.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/SteveOmondi/eye-dentity.git
cd eye-dentity

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development environment with Docker
docker-compose up -d

# Run database migrations
docker exec -it eye-dentity-backend npx prisma migrate dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# API Health: http://localhost:3000/health
```

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features (Phase 1 - MVP)
- 🔐 **User Authentication** - Secure JWT-based authentication
- 📝 **Structured Data Input** - Profession-specific forms
- 🎨 **Template Selection** - Multiple website templates with customization
- 🔍 **Domain Search** - Real-time availability checking
- 💳 **Payment Integration** - Stripe subscription management
- 🤖 **AI Website Generation** - Claude/GPT-4 powered content creation
- 📊 **Admin Dashboard** - User and website management

### Automation Features (Phase 2)
- ☁️ **Automated Hosting** - DigitalOcean provisioning
- 🌐 **Domain Registration** - Cloudflare API integration
- 🔒 **SSL/CDN Setup** - Automatic HTTPS and CDN configuration
- 📧 **Email Hosting** - Optional professional email setup
- 📈 **Daily Reports** - Email and Telegram notifications

### Marketing Features (Phase 3)
- 📱 **Social Media Marketing** - Meta (Facebook/Instagram), LinkedIn
- 🎯 **Google Ads Integration** - Automated campaign management
- 💰 **Budget Management** - Weekly budget enforcement
- 📊 **Analytics Dashboard** - ROI tracking and performance metrics
- 🔍 **Advanced SEO** - Location-based and industry-specific optimization

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Routing:** React Router

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **Cache:** Redis
- **Authentication:** JWT + bcryptjs
- **Validation:** Zod

### AI & Services
- **AI Content:** Claude (Anthropic) + OpenAI GPT-4
- **Hosting:** DigitalOcean (Droplets & Kubernetes)
- **Domain/CDN:** Cloudflare
- **Payments:** Stripe
- **Email:** SendGrid
- **Notifications:** Telegram Bot API

### DevOps
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Kubernetes (production)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana (planned)
- **Logging:** ELK Stack (planned)

## 📁 Project Structure

```
eye-dentity/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Zustand store
│   │   ├── utils/        # Utility functions
│   │   └── index.css     # Tailwind styles
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile.dev
│
├── backend/              # Node.js backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── index.ts      # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile.dev
│
├── ai-agents/            # AI workflow configurations
│   ├── actions/          # AI actions
│   └── *.yaml            # Workflow definitions
│
├── infra/                # Infrastructure as code
│   └── docker/           # Docker configurations
│
├── shared/               # Shared code
│   ├── types/            # TypeScript types
│   └── utils/            # Shared utilities
│
├── templates/            # Website templates
│
├── docs/                 # Documentation
│   ├── PRD.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── QUICK_START_GUIDE.md
│   └── ...
│
├── docker-compose.yml    # Development environment
├── .github/              # GitHub Actions workflows
└── README.md             # This file
```

## 💻 Installation

### Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **Git**

### Local Development (Without Docker)

```bash
# 1. Clone repository
git clone https://github.com/SteveOmondi/eye-dentity.git
cd eye-dentity

# 2. Install backend dependencies
cd backend
cp .env.example .env
npm install
npx prisma generate

# 3. Install frontend dependencies
cd ../frontend
cp .env.example .env
npm install

# 4. Setup database (requires PostgreSQL running)
cd ../backend
npx prisma migrate dev

# 5. Start backend (in one terminal)
npm run dev

# 6. Start frontend (in another terminal)
cd ../frontend
npm run dev
```

### Docker Development (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/SteveOmondi/eye-dentity.git
cd eye-dentity

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all services
docker-compose up -d

# 4. Run database migrations
docker exec -it eye-dentity-backend npx prisma migrate dev

# 5. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio
npm run test         # Run tests (coming soon)
npm run lint         # Run ESLint
```

**Frontend:**
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Execute command in backend container
docker exec -it eye-dentity-backend <command>

# Access PostgreSQL
docker exec -it eye-dentity-postgres psql -U eye_dentity -d eye_dentity
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2025-11-09T10:00:00.000Z",
  "service": "eye-dentity-api"
}
```

_More endpoints will be added as features are implemented._

## 🚢 Deployment

### Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Environment Variables (Production)

Ensure all environment variables are properly configured:

**Backend:**
- `NODE_ENV=production`
- `DATABASE_URL` - Production PostgreSQL URL
- `JWT_SECRET` - Strong secret key
- `STRIPE_SECRET_KEY` - Production Stripe key
- `CLOUDFLARE_API_KEY` - Cloudflare credentials
- `DIGITALOCEAN_API_TOKEN` - DigitalOcean token
- And all other API keys from `.env.example`

**Frontend:**
- `VITE_API_URL` - Production API URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key

## 📅 Development Roadmap

### ✅ Week 1: Project Setup (COMPLETED)
- [x] Repository structure
- [x] Frontend (React + Vite + Tailwind)
- [x] Backend (Node.js + Express + TypeScript)
- [x] Database schema (Prisma)
- [x] Authentication system
- [x] Docker Compose setup
- [x] GitHub Actions CI/CD

### 🚧 Week 2: User Input & Templates (IN PROGRESS)
- [ ] Multi-step user input form
- [ ] Template system (3 templates)
- [ ] Template selection UI
- [ ] Profile data API
- [ ] Logo upload functionality

### 📋 Weeks 3-12
See [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the complete roadmap.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier (coming soon)
- **Commits:** Conventional Commits format
- **Tests:** Jest (coming in Week 4)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/SteveOmondi/eye-dentity/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SteveOmondi/eye-dentity/discussions)

## 🙏 Acknowledgments

- Built with [Claude](https://anthropic.com) AI assistance
- Inspired by the need for accessible website creation
- Thanks to all contributors

---

**Made with ❤️ by the Eye-Dentity Team**
