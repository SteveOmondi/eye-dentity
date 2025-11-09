# AI Website Builder Platform - Product Requirements Document (PRD)

## Overview
A fully automated, AI-powered platform that allows individuals and small businesses to create professional websites by inputting structured data, selecting templates, and choosing a domain. The system handles domain registration, hosting, deployment, and marketing — all orchestrated by AI agents.

## Target Users
- Individual professionals: lawyers, doctors, designers, developers
- Small businesses across industries

## Core Features
- Structured data input form
- Profession-specific templates and color schemes
- Domain search and availability check
- Email hosting option
- Hosting plan selection (monthly billing)
- Payment integration (Stripe, PayPal, Skrill)
- AI-generated website content and layout
- Domain registration via registrar (e.g., Cloudflare)
- Hosting setup on DigitalOcean (containerized)
- Admin dashboard for users and system admin
- Cloudflare integration for HTTPS and CDN
- AI agent orchestration for full automation
- AI-powered marketing automation (IG, FB, LinkedIn, Google Ads)
- Daily reports via email and Telegram
- Resume/company profile export
- AI SEO (basic to advanced by plan)

## Plans & Pricing
- **Basic**: 1 template, AI SEO, resume export
- **Pro**: Multiple templates, location-based SEO, company profile, email hosting
- **Premium**: All features + marketing automation

## Scalability Goals
- Containerized microservices
- Horizontal scaling via Kubernetes
- Stateless services with persistent storage

## Tech Stack
- Frontend: React + Tailwind
- Backend: Node.js + Express
- AI: Claude + OpenAI APIs
- Hosting: DigitalOcean
- Domain: Cloudflare Registrar
- CI/CD: GitHub Actions
- Agentic AI: Claude Code + GitHub repo orchestration

---

# Implementation Roadmap

## Phase 1: MVP (Weeks 1–4)
- User input form
- Template selection
- Domain search and suggestions
- Hosting plan selection
- Stripe integration
- AI website generation (basic)
- DigitalOcean deployment
- Admin dashboard (basic)

## Phase 2: Automation & AI (Weeks 5–8)
- Claude agent integration
- Domain registration via Cloudflare API
- Email hosting setup
- Cloudflare HTTPS/CDN
- Telegram/email reporting
- Resume/company profile export

## Phase 3: Marketing & Growth (Weeks 9–12)
- AI marketing agent (Meta, LinkedIn, Google Ads)
- Weekly budget enforcement
- Marketing vs sales dashboard
- Cross-sell modules
- Advanced SEO (location-based, industry-specific)
