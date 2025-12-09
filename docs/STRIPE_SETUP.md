# Stripe Setup Guide for Eye-Dentity

Complete guide to setting up Stripe payment processing with Google Pay, Apple Pay, and other payment methods.

## Quick Setup (5 minutes)

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete business verification (for production)

### 2. Get API Keys

#### Test Mode (Development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Click "Developers" → "API keys"
3. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

#### Live Mode (Production)

1. Switch to "Live mode" in dashboard
2. Complete account activation
3. Get live keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### 3. Configure Environment Variables

Add to `backend/.env`:

```bash
# Stripe Test Keys (Development)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# For production, use live keys:
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Add to `frontend/.env`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

---

## Enable Payment Methods

### Google Pay & Apple Pay (Automatic)

**Good news!** Google Pay and Apple Pay are **automatically enabled** in Stripe Checkout when:

1. ✅ User's browser/device supports them
2. ✅ User has Google Pay or Apple Pay set up
3. ✅ Your domain is served over HTTPS (production)

**No additional configuration needed!** They'll appear automatically in the checkout.

### Enable Additional Payment Methods

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods)
2. Enable desired payment methods:
   - ✅ **Cards** (enabled by default)
   - ✅ **Google Pay** (automatic)
   - ✅ **Apple Pay** (automatic)
   - ✅ **Link** (Stripe's one-click payment)
   - 🌍 **ACH Direct Debit** (US bank transfers)
   - 🌍 **SEPA Direct Debit** (European bank transfers)
   - 🌍 **iDEAL** (Netherlands)
   - 🌍 **Klarna** (Buy now, pay later)

### Payment Method Configuration

Current configuration in `payment.controller.ts`:

```typescript
payment_method_types: ['card'], // Enables cards + digital wallets
payment_method_options: {
  card: {
    request_three_d_secure: 'automatic', // Enhanced security
  },
},
```

**Digital wallets (Google Pay, Apple Pay, Link) are automatically available** when users have them configured.

---

## Webhook Setup

Webhooks notify your backend when payment events occur.

### Local Development (Stripe CLI)

#### 1. Install Stripe CLI

**Windows (with Scoop):**
```bash
scoop install stripe
```

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from https://github.com/stripe/stripe-cli/releases
```

#### 2. Login to Stripe

```bash
stripe login
```

#### 3. Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

This will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

#### 4. Add Webhook Secret to .env

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### 5. Test Webhook Events

In another terminal:

```bash
# Trigger successful payment
stripe trigger checkout.session.completed

# Trigger failed payment
stripe trigger payment_intent.payment_failed
```

### Production Webhooks

#### 1. Create Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL:
   ```
   https://api.yourdomain.com/api/payments/webhook
   ```

#### 2. Select Events to Listen

Select these events:
- ✅ `checkout.session.completed`
- ✅ `checkout.session.expired`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`

#### 3. Get Webhook Signing Secret

After creating the endpoint, copy the signing secret (starts with `whsec_`).

Add to production `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
```

---

## Testing Payments

### Test Cards

Stripe provides test cards for different scenarios:

#### Successful Payments

```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### Failed Payments

```
Card: 4000 0000 0000 0002
Reason: Card declined
```

#### Requires Authentication (3D Secure)

```
Card: 4000 0025 0000 3155
Reason: Requires 3D Secure authentication
```

#### Insufficient Funds

```
Card: 4000 0000 0000 9995
Reason: Insufficient funds
```

### Test Google Pay

1. Use Chrome browser
2. Have Google Pay set up in your Google account
3. Visit checkout page
4. Google Pay button will appear automatically
5. Use test card in Google Pay wallet

### Test Apple Pay

1. Use Safari on macOS or iOS
2. Have Apple Pay set up
3. Visit checkout page over HTTPS
4. Apple Pay button will appear automatically
5. Use test card in Apple Pay wallet

---

## Payment Flow

### 1. User Completes Order

```
User fills profile → Selects template → Chooses domain → Selects plan
```

### 2. Create Checkout Session

```typescript
POST /api/payments/create-checkout
{
  "domain": "example.com",
  "domainPrice": 12.99,
  "hostingPlan": "pro",
  "hostingPrice": 59.99,
  "emailHosting": true,
  "emailHostingPrice": 10.00,
  "metadata": {
    "templateId": "professional",
    "colorScheme": "navy",
    "profileData": { ... }
  }
}
```

### 3. Redirect to Stripe Checkout

```typescript
// Response includes checkout URL
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### 4. User Completes Payment

User sees Stripe Checkout with options:
- 💳 Credit/Debit Card
- 📱 Google Pay (if available)
- 🍎 Apple Pay (if available)
- 🔗 Link (if user has it)

### 5. Webhook Triggers Website Generation

```
Payment Success → Webhook → Order Completed → Website Generation → Deployment
```

---

## Security Best Practices

### 1. Never Expose Secret Keys

❌ **Never** commit secret keys to Git
❌ **Never** use secret keys in frontend code
✅ Use environment variables
✅ Use `.env.example` for documentation

### 2. Verify Webhook Signatures

Already implemented in `payment.controller.ts`:

```typescript
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  STRIPE_CONFIG.webhookSecret
);
```

### 3. Use HTTPS in Production

- Required for Google Pay and Apple Pay
- Required for PCI compliance
- Already configured in deployment

### 4. Enable 3D Secure

Already enabled:

```typescript
payment_method_options: {
  card: {
    request_three_d_secure: 'automatic',
  },
},
```

---

## Pricing & Fees

### Stripe Fees (as of 2024)

**Standard Pricing:**
- 2.9% + $0.30 per successful card charge
- No setup fees
- No monthly fees
- No hidden costs

**Digital Wallets (Google Pay, Apple Pay):**
- Same rate: 2.9% + $0.30
- No additional fees

**International Cards:**
- Additional 1.5% for international cards
- Additional 1% for currency conversion

**Subscriptions:**
- Same rate: 2.9% + $0.30 per charge
- No additional subscription fees

### Example Costs

**$59.99 Pro Plan:**
- Stripe fee: $2.04
- You receive: $57.95

**$99.99 Premium Plan:**
- Stripe fee: $3.20
- You receive: $96.79

---

## Monitoring & Analytics

### Stripe Dashboard

View in real-time:
- Total revenue
- Successful payments
- Failed payments
- Refunds
- Customer lifetime value

### Key Metrics to Track

1. **Payment Success Rate**
   - Target: >95%
   - Monitor failed payments

2. **Checkout Abandonment**
   - Track `checkout.session.expired` events
   - Optimize checkout flow

3. **Dispute Rate**
   - Target: <0.5%
   - Respond quickly to disputes

4. **Refund Rate**
   - Monitor refund requests
   - Improve product quality

---

## Troubleshooting

### "No such customer" Error

**Cause:** Using test key with live customer or vice versa

**Solution:**
```bash
# Ensure you're using matching keys
# Test mode: sk_test_... and pk_test_...
# Live mode: sk_live_... and pk_live_...
```

### "Webhook signature verification failed"

**Cause:** Wrong webhook secret

**Solution:**
```bash
# For local development, use Stripe CLI secret
stripe listen --forward-to localhost:3000/api/payments/webhook

# For production, use webhook secret from Stripe Dashboard
```

### Google Pay Not Showing

**Possible causes:**
1. Not using HTTPS (required in production)
2. Browser doesn't support Google Pay
3. User doesn't have Google Pay set up

**Solution:**
- Test in Chrome browser
- Ensure HTTPS in production
- Set up Google Pay in your Google account

### Apple Pay Not Showing

**Possible causes:**
1. Not using Safari browser
2. Not on Apple device
3. Apple Pay not set up

**Solution:**
- Test on Safari (macOS/iOS)
- Ensure HTTPS
- Set up Apple Pay in device settings

---

## Going Live Checklist

Before switching to production:

- [ ] Complete Stripe account verification
- [ ] Switch to live API keys
- [ ] Configure production webhook endpoint
- [ ] Test with real (small amount) payment
- [ ] Enable HTTPS on your domain
- [ ] Test Google Pay and Apple Pay
- [ ] Set up email notifications
- [ ] Configure tax settings (if applicable)
- [ ] Review Stripe's terms of service
- [ ] Set up fraud prevention rules

---

## Support

### Stripe Resources

- **Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **API Reference:** [stripe.com/docs/api](https://stripe.com/docs/api)
- **Support:** [support.stripe.com](https://support.stripe.com)
- **Status:** [status.stripe.com](https://status.stripe.com)

### Eye-Dentity Resources

- **Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)

---

**Last Updated:** December 2024  
**Stripe API Version:** 2024-12-18
