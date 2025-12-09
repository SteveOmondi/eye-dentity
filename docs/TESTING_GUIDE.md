# Testing Guide for Eye-Dentity MVP

This guide covers testing the website generation system and Stripe payment integration.

## Prerequisites

### Required Environment Variables

Create a `.env` file in the `backend` directory with:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/eye_dentity?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Services (at least one required)
ANTHROPIC_API_KEY=sk-ant-your-claude-api-key
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe (use test mode keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Optional
SENDGRID_API_KEY=your-sendgrid-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Testing AI Content Generation

### 1. Run the Test Script

```bash
cd backend

# Test with a specific profile
npx tsx scripts/test-content-generation.ts --profile lawyer

# Test with all profiles
npx tsx scripts/test-content-generation.ts --all

# Test with OpenAI instead of Claude
npx tsx scripts/test-content-generation.ts --profile doctor --provider openai
```

### 2. Review Generated Content

Generated content is saved to `backend/test-output/` directory.

**Example output:**
```
✅ Content generated successfully in 3.45s

📄 HOMEPAGE:
  Headline: Sarah Johnson - Corporate Law Expert
  Subheadline: Experienced attorney providing comprehensive legal solutions
  ...

📖 ABOUT:
  Title: About Sarah Johnson
  Content: With over 15 years of experience...

🛠️ SERVICES:
  Title: Services
  Services count: 4
  1. Corporate Law
  2. Business Litigation
  ...
```

### 3. Validate Content Quality

Check the generated JSON files for:
- ✅ Proper structure (all required sections)
- ✅ Profession-appropriate tone
- ✅ SEO-optimized keywords
- ✅ Compelling copy
- ✅ No placeholder text

## Testing Template Rendering

### 1. Create Test Script

Create `backend/scripts/test-template-render.ts`:

```typescript
import TemplateRendererService from '../src/services/template-renderer.service';
import ContentGeneratorService from '../src/services/content-generator.service';
import testProfiles from '../src/data/test-profiles.json';
import * as fs from 'fs/promises';

async function testRender() {
  const profile = testProfiles[0]; // Lawyer profile
  
  // Generate content
  const contentGen = new ContentGeneratorService();
  const content = await contentGen.generateWebsiteContent(profile, 'claude');
  
  // Render template
  const renderer = new TemplateRendererService();
  const html = await renderer.renderWebsite({
    templateId: 'professional',
    content,
    colorScheme: 'navy',
    profileData: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    },
  });
  
  // Save output
  await fs.writeFile('test-output/rendered-website.html', html, 'utf-8');
  console.log('✅ Website rendered successfully!');
  console.log('📄 Output saved to: test-output/rendered-website.html');
}

testRender().catch(console.error);
```

### 2. Run Template Test

```bash
npx tsx scripts/test-template-render.ts
```

### 3. View Rendered Website

Open `backend/test-output/rendered-website.html` in a browser to see the final result.

## Testing Stripe Integration

### 1. Set Up Stripe Test Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Get your test API keys
3. Add to `.env` file

### 2. Test Checkout Flow

#### Start the Backend

```bash
cd backend
npm run dev
```

#### Start the Frontend

```bash
cd frontend
npm run dev
```

#### Complete a Test Order

1. Register/Login at `http://localhost:5173`
2. Create a profile
3. Select a template
4. Choose a domain
5. Select a hosting plan
6. Proceed to checkout

#### Use Stripe Test Cards

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Failed Payment:**
```
Card: 4000 0000 0000 0002
```

**Requires Authentication:**
```
Card: 4000 0025 0000 3155
```

### 3. Test Webhook Handling

#### Install Stripe CLI

```bash
# Windows (with Scoop)
scoop install stripe

# Or download from https://stripe.com/docs/stripe-cli
```

#### Forward Webhooks to Local

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

This will give you a webhook secret like `whsec_xxx`. Add it to your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### Trigger Test Events

```bash
# Trigger successful payment
stripe trigger checkout.session.completed

# Trigger failed payment
stripe trigger payment_intent.payment_failed
```

### 4. Verify Webhook Processing

Check backend logs for:
```
✅ Order order_xxx marked as completed
✅ Triggering website generation for order order_xxx...
✅ Website generation completed
```

Check database:
```sql
SELECT * FROM "Order" WHERE status = 'COMPLETED';
SELECT * FROM "Website" WHERE status = 'LIVE';
```

## Testing Complete User Flow

### End-to-End Test

1. **Register**: Create new account
2. **Profile**: Fill profile (use test data)
3. **Template**: Select professional template + navy color
4. **Domain**: Search for domain (e.g., `test-lawyer-site.com`)
5. **Plan**: Select Pro plan with email hosting
6. **Payment**: Complete with test card `4242 4242 4242 4242`
7. **Wait**: Website generation (15-20 minutes)
8. **Verify**: Check email for "Website is Live" notification
9. **Visit**: Open website URL

### Expected Results

✅ Order created with status `PENDING`
✅ Payment successful, order status → `COMPLETED`
✅ Website record created with status `GENERATING`
✅ AI content generated
✅ Template rendered
✅ Website files saved
✅ Website status → `GENERATED` or `LIVE`
✅ Email notifications sent
✅ Website accessible at URL

## Troubleshooting

### AI Content Generation Issues

**Error: "No API key found"**
```bash
# Check .env file has API key
echo $ANTHROPIC_API_KEY  # or $OPENAI_API_KEY
```

**Error: "Rate limit exceeded"**
- Wait a few minutes
- Use different provider
- Check API quota

**Error: "Invalid JSON response"**
- Check AI prompt formatting
- Review generated content in logs
- Use fallback content generator

### Stripe Issues

**Error: "No such customer"**
- Ensure using test mode keys
- Check Stripe dashboard

**Error: "Webhook signature verification failed"**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Use Stripe CLI for local testing

**Payment not triggering website generation**
- Check webhook is being received
- Verify order metadata includes `profileData`, `templateId`, `colorScheme`
- Check backend logs for errors

### Database Issues

**Error: "Database connection failed"**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env

# Run migrations
npx prisma migrate dev
```

**Error: "Template not found"**
```bash
# Seed database with templates
npx prisma db seed
```

## Performance Testing

### Load Test Content Generation

```bash
# Generate content for all test profiles
for i in {1..5}; do
  npx tsx scripts/test-content-generation.ts --all
done
```

### Measure Response Times

- Content generation: Target < 5 seconds
- Template rendering: Target < 1 second
- Checkout creation: Target < 2 seconds
- Website generation: Target < 20 minutes

## Next Steps

After successful testing:

1. ✅ Verify all test profiles generate quality content
2. ✅ Confirm all color schemes render correctly
3. ✅ Test payment flow with all test cards
4. ✅ Verify webhook handling
5. ✅ Check email notifications
6. ✅ Review generated websites

Then proceed to:
- Set up staging environment
- Configure production Stripe account
- Deploy to staging
- User acceptance testing

## Support

If you encounter issues:

1. Check logs: `backend/logs/` or console output
2. Review database: Use Prisma Studio (`npx prisma studio`)
3. Test API endpoints: Use Postman or curl
4. Check Stripe dashboard: View events and logs

---

**Last Updated:** December 2024
