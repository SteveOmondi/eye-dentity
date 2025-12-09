# Eye-Dentity MVP - Quick Start

Get the Eye-Dentity platform running locally in minutes.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn
- Git

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/SteveOmondi/eye-dentity.git
cd eye-dentity

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend environment
cd backend
cp .env.example .env

# Edit .env and add your keys:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (any random string)
# - ANTHROPIC_API_KEY or OPENAI_API_KEY
# - STRIPE_SECRET_KEY (test mode)
```

**Minimum required `.env`:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/eye_dentity"
JWT_SECRET=your-secret-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
STRIPE_SECRET_KEY=sk_test_your-key-here
STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Health:** http://localhost:3000/health

## Test the Platform

### 1. Register an Account

1. Go to http://localhost:5173
2. Click "Get Started"
3. Fill registration form
4. Log in

### 2. Create a Profile

Use test data from `backend/src/data/test-profiles.json`:

```json
{
  "name": "Sarah Johnson",
  "profession": "Lawyer",
  "bio": "Experienced attorney specializing in corporate law...",
  "services": ["Corporate Law", "Business Litigation"],
  "email": "sarah@example.com",
  "phone": "+1 (555) 123-4567"
}
```

### 3. Test AI Content Generation

```bash
cd backend
npx tsx scripts/test-content-generation.ts --profile lawyer
```

### 4. Test Payment (Stripe Test Mode)

Use Stripe test card:
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

## Common Issues

### Database Connection Error

```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Try: npx prisma migrate reset
```

### API Key Error

```bash
# Ensure you have at least one AI API key:
# ANTHROPIC_API_KEY or OPENAI_API_KEY
```

### Port Already in Use

```bash
# Backend (port 3000)
# Kill process: npx kill-port 3000

# Frontend (port 5173)
# Kill process: npx kill-port 5173
```

## Next Steps

- Read [API Reference](./API_REFERENCE.md)
- Review [User Guide](./USER_GUIDE.md)
- Check [Testing Guide](./TESTING_GUIDE.md)
- See [Deployment Guide](../DEPLOYMENT.md)

## Development Tools

### Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

### View Logs

```bash
# Backend logs
cd backend
tail -f logs/app.log

# Or check console output
```

### API Testing

Use the API reference and test with:
- Postman
- curl
- Thunder Client (VS Code extension)

## Project Structure

```
eye-dentity/
├── backend/          # Node.js API
│   ├── src/
│   ├── prisma/
│   └── scripts/
├── frontend/         # React app
│   └── src/
├── templates/        # Website templates
│   └── professional/
└── docs/            # Documentation
```

## Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/SteveOmondi/eye-dentity/issues)

---

**Ready to build?** Start with the [User Guide](./USER_GUIDE.md)!
