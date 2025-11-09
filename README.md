# AI Website Builder Platform

## Overview
This is a fully automated, AI-powered platform that enables professionals and small businesses to create and deploy websites effortlessly. Users input structured data, select templates, choose a domain, and the system handles everything from domain registration to hosting and marketing — powered by Claude agents.

---

## Features
- Structured data input form
- Profession-specific templates
- Domain search and registration
- Hosting plan selection
- AI-generated website content
- Deployment on DigitalOcean
- Cloudflare HTTPS/CDN integration
- Admin dashboard for users and system admin
- AI-powered marketing automation
- Daily reports via email and Telegram

---

## Tech Stack
- **Frontend**: React + Tailwind
- **Backend**: Node.js + Express
- **AI Agents**: Claude Code
- **Hosting**: DigitalOcean (Docker containers)
- **Domain**: Cloudflare Registrar
- **CI/CD**: GitHub Actions
- **Payments**: Stripe, PayPal, Skrill

---

## Repo Structure
/frontend # React UI 
/backend # Node.js API 
/ai-agent # Claude workflows 
/infra # Docker, Terraform, Kubernetes 
/docs # Markdown documentation


---

## Getting Started

1. Clone the repo
2. Set up environment variables for API keys (Cloudflare, DigitalOcean, Stripe, etc.)
3. Run `docker-compose up` to start local development
4. Use Claude workflows in `/ai-agent` to automate provisioning

---

## Automation Goals

- Zero manual intervention
- Claude agents handle:
  - Website generation
  - Infrastructure setup
  - Marketing execution
  - Reporting and alerts

---

## Reporting

- Daily email summary
- Telegram alerts via Bot API
- Marketing vs sales dashboard
