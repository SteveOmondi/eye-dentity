# Cost Breakdown Sheet for AI Website Builder Platform

This document estimates monthly infrastructure costs for running the platform at different user scales: 10, 100, and 1000 users. It includes domain registration, hosting, Cloudflare CDN/HTTPS, and other essential services.

---

## 1. Assumptions

- **Domain Registration**: $12/year per domain → $1/month
- **Hosting**: DigitalOcean Basic Droplet ($6/month per user)
- **Cloudflare**:
  - Free plan for basic CDN/HTTPS
  - Pro plan ($20/month) for advanced features (used at scale)
- **Email Hosting**: Optional, estimated at $1/user/month
- **AI API Usage**: Estimated $0.50–$2/user/month depending on usage
- **Marketing Budget**: $50/week/channel (Instagram, Facebook, LinkedIn, Google Ads)

---

## 2. Monthly Cost Table

| Users | Domain Cost | Hosting Cost | Cloudflare | Email Hosting | AI API | Marketing | **Total Monthly** |
|-------|-------------|--------------|------------|----------------|--------|-----------|-------------------|
| 10    | $10         | $60          | $0 (Free)  | $10            | $10    | $800      | **$890**          |
| 100   | $100        | $600         | $20 (Pro)  | $100           | $100   | $800      | **$1,720**        |
| 1000  | $1,000      | $6,000       | $200 (Business) | $1,000     | $1,000 | $800      | **$10,000**       |

---

## 3. Notes

- **Cloudflare Pro** is sufficient for up to 100 users; Business plan recommended for 1000+
- **DigitalOcean** pricing may vary based on droplet specs and bandwidth
- **AI API costs** depend on Claude/OpenAI usage per user
- **Marketing budget** is fixed at $200/week across 4 channels

---

## 4. Sources

- [DigitalOcean Pricing](https://www.digitalocean.com/pricing)
- [Cloudflare Plans](https://www.cloudflare.com/plans/)
- [Google Ads Budgeting](https://support.google.com/google-ads/answer/2375411)
- [Domain Registrars](https://www.namecheap.com/domains/registration/)

