# Paystack Setup Guide for Eye-Dentity

Complete guide to setting up Paystack payment processing for Kenya and African markets, including M-Pesa integration.

## Why Paystack?

✅ **Supports Kenya** and 4 other African countries  
✅ **M-Pesa integration** (most popular payment method in Kenya)  
✅ **Lower fees** for local transactions  
✅ **Owned by Stripe** (acquired in 2020)  
✅ **Similar API** to Stripe (easy to use)  

## Supported Countries

- 🇰🇪 **Kenya** (KES)
- 🇳🇬 Nigeria (NGN)
- 🇿🇦 South Africa (ZAR)
- 🇬🇭 Ghana (GHS)
- 🇪🇬 Egypt (EGP)

## Payment Methods in Kenya

- 💳 **Visa/Mastercard** (local and international)
- 📱 **M-Pesa** (most popular!)
- 🏦 **Bank transfers**
- 💰 **Mobile money**
- 📞 **USSD** codes

---

## Quick Setup (10 minutes)

### 1. Create Paystack Account

1. Go to [paystack.com](https://paystack.com)
2. Click "Get Started"
3. Fill in your business details:
   - Business name
   - Business email
   - Phone number
   - Country (select **Kenya**)
4. Verify your email
5. Complete KYC (Know Your Customer):
   - Business registration documents
   - ID verification
   - Bank account details

### 2. Get API Keys

#### Test Mode (Development)

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to "Settings" → "API Keys & Webhooks"
3. Copy your **Test** keys:
   - **Public Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

#### Live Mode (Production)

1. Complete business verification
2. Switch to "Live" mode in dashboard
3. Get **Live** keys:
   - **Public Key**: `pk_live_...`
   - **Secret Key**: `sk_live_...`

### 3. Configure Environment Variables

Add to `backend/.env`:

```bash
# Paystack Test Keys (Development)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# For production, use live keys:
# PAYSTACK_SECRET_KEY=sk_live_...
# PAYSTACK_PUBLIC_KEY=pk_live_...
```

Add to `frontend/.env`:

```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

---

## Payment Flow

### 1. Initialize Payment

```typescript
POST /api/payments/initialize
{
  "domain": "example.com",
  "domainPrice": 1299, // KES 1,299
  "hostingPlan": "pro",
  "hostingPrice": 5999, // KES 5,999
  "emailHosting": true,
  "emailHostingPrice": 1000, // KES 1,000
  "metadata": {
    "templateId": "professional",
    "colorScheme": "navy",
    "profileData": { ... }
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_123",
  "reference": "EYE-1234567890-ABC123",
  "authorizationUrl": "https://checkout.paystack.com/xyz",
  "accessCode": "abc123xyz"
}
```

### 2. Redirect User to Payment Page

```typescript
// Redirect user to authorizationUrl
window.location.href = authorizationUrl;
```

User will see Paystack checkout with options:
- 💳 Pay with Card
- 📱 Pay with M-Pesa
- 🏦 Pay with Bank Transfer
- 📞 Pay with USSD

### 3. User Completes Payment

User selects payment method and completes payment.

### 4. Verify Payment

After payment, Paystack redirects to your callback URL:

```
http://localhost:5173/payment/callback?reference=EYE-1234567890-ABC123
```

Your frontend calls:

```typescript
GET /api/payments/verify/EYE-1234567890-ABC123
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "transaction": {
    "reference": "EYE-1234567890-ABC123",
    "amount": 8298, // KES 8,298
    "currency": "KES",
    "channel": "mobile_money", // or "card", "bank"
    "paidAt": "2024-12-01T12:00:00Z"
  }
}
```

---

## M-Pesa Integration

### How M-Pesa Works

1. User selects "Pay with M-Pesa"
2. Enters M-Pesa phone number
3. Receives STK Push notification on phone
4. Enters M-Pesa PIN
5. Payment confirmed instantly

### M-Pesa Test Numbers

Paystack provides test phone numbers for M-Pesa:

**Successful Payment:**
```
Phone: 254708374149
PIN: Any 4 digits
```

**Failed Payment:**
```
Phone: 254708374150
PIN: Any 4 digits
```

### M-Pesa Fees

- **Transaction fee**: 1.5% + KES 25
- **No additional charges** for customers
- **Instant settlement** to your account

---

## Webhook Setup

Webhooks notify your backend when payment events occur.

### 1. Configure Webhook URL

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/settings/developer)
2. Click "API Keys & Webhooks"
3. Scroll to "Webhook URL"
4. Enter your webhook URL:
   ```
   https://api.yourdomain.com/api/payments/webhook
   ```
5. Click "Save Changes"

### 2. Webhook Events

Paystack will send these events:

- ✅ `charge.success` - Payment successful
- ❌ `charge.failed` - Payment failed
- 💸 `transfer.success` - Payout successful
- ❌ `transfer.failed` - Payout failed

### 3. Test Webhooks Locally

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in Paystack dashboard
# Example: https://abc123.ngrok.io/api/payments/webhook
```

### 4. Webhook Security

Webhooks are secured with signatures. Our controller automatically validates them:

```typescript
// Already implemented in paystack-payment.controller.ts
const isValid = paystackService.validateWebhookSignature(signature, req.body);
```

---

## Testing Payments

### Test Cards

Paystack provides test cards for different scenarios:

#### Successful Payments

**Visa:**
```
Card: 4084 0840 8408 4081
Expiry: 12/34
CVV: 408
PIN: 0000
```

**Mastercard:**
```
Card: 5399 8383 8383 8381
Expiry: 12/34
CVV: 883
PIN: 0000
```

#### Failed Payments

**Insufficient Funds:**
```
Card: 5060 6666 6666 6666 6666
Expiry: 12/34
CVV: 123
```

**Invalid Card:**
```
Card: 4084 0840 8408 4082
Expiry: 12/34
CVV: 408
```

### Test M-Pesa

Use test phone numbers provided above.

### Test Bank Transfer

Paystack will provide test bank account details in test mode.

---

## Pricing & Fees

### Paystack Fees (Kenya)

**Local Cards (Kenyan cards):**
- 1.5% + KES 25 per transaction
- No setup fees
- No monthly fees

**International Cards:**
- 3.9% + KES 100 per transaction

**M-Pesa:**
- 1.5% + KES 25 per transaction
- Most cost-effective for Kenyan customers

**Bank Transfer:**
- 1.5% + KES 25 per transaction

### Example Costs

**KES 5,999 Pro Plan (M-Pesa):**
- Paystack fee: KES 115
- You receive: KES 5,884

**KES 9,999 Premium Plan (M-Pesa):**
- Paystack fee: KES 175
- You receive: KES 9,824

**KES 5,999 Pro Plan (International Card):**
- Paystack fee: KES 334
- You receive: KES 5,665

---

## Currency Handling

### Kenyan Shilling (KES)

Paystack uses **kobo** (smallest currency unit):
- 1 KES = 100 cents
- Amount in kobo = Amount in KES × 100

**Example:**
```typescript
// KES 5,999 becomes 599,900 kobo
const amountInKobo = 5999 * 100; // 599900

// Our service handles this automatically
paystackService.convertToKobo(5999); // 599900
paystackService.convertFromKobo(599900); // 5999
```

### Multi-Currency Support

You can accept payments in:
- **KES** (Kenyan Shilling)
- **NGN** (Nigerian Naira)
- **GHS** (Ghanaian Cedi)
- **ZAR** (South African Rand)
- **USD** (US Dollar)

---

## Going Live Checklist

Before switching to production:

- [ ] Complete Paystack business verification
- [ ] Submit required documents (business registration, ID)
- [ ] Add bank account for settlements
- [ ] Switch to live API keys
- [ ] Configure production webhook URL
- [ ] Test with real (small amount) payment
- [ ] Enable HTTPS on your domain
- [ ] Test M-Pesa with real phone number
- [ ] Set up email notifications
- [ ] Review Paystack's terms of service
- [ ] Set up fraud prevention rules

---

## Business Verification

### Required Documents (Kenya)

1. **Business Registration:**
   - Certificate of Incorporation
   - Business Registration Certificate
   - KRA PIN Certificate

2. **ID Verification:**
   - National ID or Passport
   - Director's ID

3. **Bank Account:**
   - Bank statement (last 3 months)
   - Bank account details

### Verification Timeline

- **Submission**: 1-2 days
- **Review**: 3-5 business days
- **Approval**: Instant after review

---

## Monitoring & Analytics

### Paystack Dashboard

View in real-time:
- Total revenue
- Successful payments
- Failed payments
- Refunds
- Payment channels breakdown
- M-Pesa vs Card vs Bank

### Key Metrics

1. **Payment Success Rate**
   - Target: >95%
   - Monitor failed payments

2. **M-Pesa Adoption**
   - Track M-Pesa usage
   - Most popular in Kenya

3. **Settlement Time**
   - T+1 for local payments
   - T+3 for international

---

## Troubleshooting

### "Invalid API Key"

**Cause:** Wrong API key or test/live mismatch

**Solution:**
```bash
# Ensure you're using matching keys
# Test mode: sk_test_... and pk_test_...
# Live mode: sk_live_... and pk_live_...
```

### "Payment Failed"

**Common causes:**
1. Insufficient funds
2. Invalid card details
3. Card declined by bank
4. Network timeout

**Solution:**
- Check error message
- Retry with different payment method
- Contact Paystack support

### M-Pesa Not Working

**Possible causes:**
1. Phone number format incorrect
2. M-Pesa not activated
3. Insufficient M-Pesa balance

**Solution:**
- Use format: 254XXXXXXXXX (no +)
- Ensure M-Pesa is activated
- Check M-Pesa balance

### Webhook Not Receiving Events

**Possible causes:**
1. Wrong webhook URL
2. Server not accessible
3. Firewall blocking Paystack

**Solution:**
- Verify webhook URL in dashboard
- Ensure server is publicly accessible
- Whitelist Paystack IPs

---

## Support

### Paystack Resources

- **Documentation:** [paystack.com/docs](https://paystack.com/docs)
- **API Reference:** [paystack.com/docs/api](https://paystack.com/docs/api)
- **Support Email:** support@paystack.com
- **Phone:** +234 1 888 3888 (Nigeria)
- **Status:** [status.paystack.com](https://status.paystack.com)

### Eye-Dentity Resources

- **Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)

---

## Comparison: Paystack vs Stripe

| Feature | Paystack | Stripe |
|---------|----------|--------|
| **Kenya Support** | ✅ Yes | ❌ No |
| **M-Pesa** | ✅ Yes | ❌ No |
| **Local Fees** | 1.5% + KES 25 | N/A |
| **International Fees** | 3.9% + KES 100 | 2.9% + $0.30 |
| **Setup** | Free | Free |
| **Settlement** | T+1 (local) | T+2 |
| **African Focus** | ✅ Yes | ❌ No |

---

**Last Updated:** December 2024  
**Paystack API Version:** v1
