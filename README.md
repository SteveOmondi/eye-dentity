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

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database
cd ../backend
npx prisma generate
npx prisma migrate dev

# Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

📖 **Detailed setup:** See [Quick Start Guide](docs/QUICK_START.md)

## ✨ Features

### 🎨 Dual-Mode Profile Builder
- **Form Mode**: Traditional step-by-step form
- **Chat Mode**: AI-powered conversational interface
- User-provided API keys for privacy

### 🤖 AI-Powered Content Generation
- Support for Claude, OpenAI, and Gemini
- Profession-specific content optimization
- SEO-optimized copy
- 10+ profession templates

### 🎭 Professional Templates
- Modern, responsive designs
- 6 color scheme variations per template
- Mobile-first approach
- Fast loading performance

### 💳 Payment Processing
- **Paystack integration** optimized for Kenya & Africa:
  - 💳 Credit/Debit Cards (Visa, Mastercard)
  - 📱 **M-Pesa** (most popular in Kenya!)
  - 🏦 Bank transfers
  - 💰 Mobile money
  - 📞 USSD codes
- Subscription management
- Secure webhook handling
- Lower fees for local transactions

### 🌐 Automated Deployment (Coming Soon)
- DigitalOcean provisioning
- Domain registration
- SSL/CDN setup
- Email hosting

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **State Management:** Zustand
- **Routing:** React Router

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **Authentication:** JWT
- **Payments:** Stripe

### AI & Services
- **AI Content:** Claude (Anthropic) + OpenAI GPT-4 + Gemini
- **Payments:** Paystack (with M-Pesa for Kenya)
- **Hosting:** DigitalOcean (planned)
- **Domain/CDN:** Cloudflare (planned)

## 📁 Project Structure

```
eye-dentity/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── config/       # Configuration (AI prompts, Stripe)
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   │   ├── content-generator.service.ts
│   │   │   ├── template-renderer.service.ts
│   │   │   └── ...
│   │   └── routes/       # API routes
│   ├── prisma/           # Database schema
│   └── scripts/          # Utility scripts
│
├── frontend/             # React application
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       └── api/          # API client
│
├── templates/            # Website templates
│   └── professional/     # Professional template
│       ├── index.html
│       ├── styles.css
│       └── color-schemes.json
│
└── docs/                 # Documentation
    ├── API_REFERENCE.md
    ├── USER_GUIDE.md
    ├── STRIPE_SETUP.md
    └── ...
```

## 📚 Documentation

### For Developers
- 🚀 [Quick Start Guide](docs/QUICK_START.md) - Get running in 5 minutes
- 📖 [API Reference](docs/API_REFERENCE.md) - Complete API documentation
- 🧪 [Testing Guide](docs/TESTING_GUIDE.md) - How to test everything
- 💳 [Paystack Setup](docs/PAYSTACK_SETUP.md) - Payment integration guide (Kenya & Africa)

### For Users
- 📘 [User Guide](docs/USER_GUIDE.md) - Complete user walkthrough
- 🗺️ [Onboarding Flow](docs/ONBOARDING_FLOW.md) - Visual user journey

### For Business
- 📋 [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) - Technical roadmap
- 📊 [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md) - Current status
- 📄 [PRD](docs/PRD.md) - Product requirements

## 🎯 Current Status

### ✅ Completed (95%)
- [x] Website generation system
- [x] AI content generation (Claude, OpenAI, Gemini)
- [x] Template rendering engine
- [x] Professional template with 6 color schemes
- [x] Stripe payment integration
- [x] Google Pay & Apple Pay support
- [x] Admin dashboard
- [x] User authentication
- [x] Comprehensive documentation

### 🚧 In Progress
- [ ] Live payment testing
- [ ] Staging environment setup
- [ ] Automated deployment

### 📋 Planned (Phase 2)
- [ ] DigitalOcean automation
- [ ] Domain registration
- [ ] Email hosting
- [ ] Marketing automation

## 🧪 Testing

### Test AI Content Generation

```bash
cd backend
npx tsx scripts/test-content-generation.ts --profile lawyer
```

### Test Payment Flow

1. Set Stripe test keys in `.env`
2. Start backend and frontend
3. Complete order flow
4. Use test card: `4242 4242 4242 4242`

See [Testing Guide](docs/TESTING_GUIDE.md) for details.

## 🚢 Deployment

### Development
```bash
docker-compose up -d
```

### Production
See [Deployment Guide](DEPLOYMENT.md)

## 💳 Payment Methods Supported

- 💳 **Credit/Debit Cards** (Visa, Mastercard, local & international)
- 📱 **M-Pesa** (Kenya's #1 payment method!)
- 🏦 **Bank Transfers** (instant verification)
- 💰 **Mobile Money** (Airtel Money, etc.)
- 📞 **USSD** (for feature phones)

**Optimized for Kenya and African markets!**

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/SteveOmondi/eye-dentity/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SteveOmondi/eye-dentity/discussions)

---

**Made with ❤️ by the Eye-Dentity Team**

**Powered by:** Paystack, Claude AI, React, Node.js, PostgreSQL
