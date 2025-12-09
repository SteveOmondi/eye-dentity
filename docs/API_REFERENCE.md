# Eye-Dentity API Reference

Complete API documentation for the Eye-Dentity platform.

**Base URL:** `http://localhost:3000/api` (development)  
**Production URL:** `https://api.eye-dentity.com/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

Get authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "cuid123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

---

## Profile Management

### Create/Update Profile

Create or update user profile information.

**Endpoint:** `POST /profiles`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "profession": "Lawyer",
  "bio": "Experienced attorney specializing in corporate law...",
  "phone": "+1 (555) 123-4567",
  "services": ["Corporate Law", "Business Litigation", "Contract Review"],
  "logoUrl": "https://storage.example.com/logos/user123.png",
  "profilePhotoUrl": "https://storage.example.com/photos/user123.jpg"
}
```

**Response:** `200 OK`
```json
{
  "id": "profile123",
  "userId": "cuid123",
  "profession": "Lawyer",
  "bio": "Experienced attorney...",
  "phone": "+1 (555) 123-4567",
  "services": ["Corporate Law", "Business Litigation"],
  "logoUrl": "https://...",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Get Profile

Retrieve user profile.

**Endpoint:** `GET /profiles/:userId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "profile123",
  "userId": "cuid123",
  "profession": "Lawyer",
  "bio": "Experienced attorney...",
  "services": ["Corporate Law", "Business Litigation"]
}
```

---

## Templates

### List Templates

Get all available templates.

**Endpoint:** `GET /templates`

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "professional", "creative")

**Response:** `200 OK`
```json
{
  "templates": [
    {
      "id": "template123",
      "name": "Professional Template",
      "category": "professional",
      "description": "Clean, modern template for professionals",
      "previewUrl": "https://storage.example.com/previews/professional.png"
    }
  ]
}
```

### Get Template Details

Get specific template information.

**Endpoint:** `GET /templates/:id`

**Response:** `200 OK`
```json
{
  "id": "template123",
  "name": "Professional Template",
  "category": "professional",
  "description": "Clean, modern template...",
  "previewUrl": "https://...",
  "colorSchemes": {
    "default": { "primary": "#2563eb", "secondary": "#1e40af" },
    "navy": { "primary": "#1e3a8a", "secondary": "#1e40af" }
  }
}
```

### Get Templates by Profession

Get recommended templates for a profession.

**Endpoint:** `GET /templates/by-profession/:profession`

**Response:** `200 OK`
```json
{
  "profession": "Lawyer",
  "templates": [
    {
      "id": "template123",
      "name": "Professional Template",
      "category": "professional"
    }
  ]
}
```

---

## Payments

### Create Checkout Session

Create a Stripe checkout session for payment.

**Endpoint:** `POST /payments/create-checkout`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "domain": "example.com",
  "domainPrice": 12.99,
  "hostingPlan": "pro",
  "hostingPrice": 59.99,
  "emailHosting": true,
  "emailHostingPrice": 10.00,
  "templateId": "template123",
  "colorScheme": "default",
  "metadata": {
    "profession": "Lawyer",
    "services": ["Corporate Law", "Litigation"]
  }
}
```

**Response:** `200 OK`
```json
{
  "sessionId": "cs_test_123",
  "url": "https://checkout.stripe.com/pay/cs_test_123"
}
```

### Get Session Status

Check payment session status.

**Endpoint:** `GET /payments/session/:sessionId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "sessionId": "cs_test_123",
  "status": "complete",
  "order": {
    "id": "order123",
    "status": "COMPLETED",
    "domain": "example.com",
    "totalAmount": 82.98
  }
}
```

### Stripe Webhook

Handle Stripe webhook events (internal use).

**Endpoint:** `POST /payments/webhook`

**Headers:** `stripe-signature: <signature>`

**Note:** This endpoint is called by Stripe, not by clients.

---

## Websites

### Create Website

Trigger website generation (usually called after payment).

**Endpoint:** `POST /websites`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderId": "order123",
  "templateId": "template123",
  "colorScheme": "default",
  "domain": "example.com"
}
```

**Response:** `202 Accepted`
```json
{
  "websiteId": "website123",
  "status": "GENERATING",
  "message": "Website generation started"
}
```

### Get Website Details

Get website information and status.

**Endpoint:** `GET /websites/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "website123",
  "domain": "example.com",
  "status": "LIVE",
  "deploymentUrl": "https://example.com",
  "template": {
    "id": "template123",
    "name": "Professional Template"
  },
  "createdAt": "2024-01-15T10:00:00.000Z",
  "publishedAt": "2024-01-15T10:15:00.000Z"
}
```

### Get User Websites

Get all websites for a user.

**Endpoint:** `GET /websites/user/:userId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "websites": [
    {
      "id": "website123",
      "domain": "example.com",
      "status": "LIVE",
      "deploymentUrl": "https://example.com",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Chat (Profile Builder)

### Create Chat Session

Start a new chat session for profile building.

**Endpoint:** `POST /chat/sessions`

**Headers:** `Authorization: Bearer <token>` (optional for anonymous)

**Request Body:**
```json
{
  "provider": "claude",
  "mode": "chat"
}
```

**Response:** `201 Created`
```json
{
  "sessionId": "session123",
  "sessionToken": "token123",
  "provider": "claude",
  "mode": "chat"
}
```

### Send Message

Send a message in a chat session.

**Endpoint:** `POST /chat/message`

**Request Body:**
```json
{
  "sessionId": "session123",
  "sessionToken": "token123",
  "message": "I'm a lawyer specializing in corporate law",
  "apiKey": "sk-ant-..." // Optional user-provided API key
}
```

**Response:** `200 OK`
```json
{
  "response": "Great! Can you tell me more about your specific services?",
  "collectedData": {
    "profession": "Lawyer",
    "specialization": "Corporate Law"
  },
  "completionProgress": 25
}
```

### Get Chat Session

Retrieve chat session details.

**Endpoint:** `GET /chat/sessions/:id`

**Query Parameters:**
- `sessionToken`: Required for anonymous sessions

**Response:** `200 OK`
```json
{
  "id": "session123",
  "messages": [
    {
      "role": "assistant",
      "content": "Hello! I'll help you create your professional profile..."
    },
    {
      "role": "user",
      "content": "I'm a lawyer specializing in corporate law"
    }
  ],
  "collectedData": {
    "profession": "Lawyer",
    "specialization": "Corporate Law"
  },
  "completionProgress": 25,
  "isComplete": false
}
```

---

## File Upload

### Upload Logo

Upload a logo image.

**Endpoint:** `POST /upload/logo`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:** Form data with `file` field

**Response:** `200 OK`
```json
{
  "url": "https://storage.example.com/logos/user123-logo.png",
  "filename": "user123-logo.png",
  "size": 45678
}
```

---

## Admin Endpoints

### Get All Users

List all users (admin only).

**Endpoint:** `GET /admin/users`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "_count": {
        "websites": 1,
        "orders": 1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 150,
    "totalPages": 8
  }
}
```

### Update User Role

Change user role (admin only).

**Endpoint:** `PUT /admin/users/:userId/role`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:** `200 OK`
```json
{
  "id": "user123",
  "email": "user@example.com",
  "role": "ADMIN"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": ["Email is required", "Password must be at least 8 characters"]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests:** 100 requests per 15 minutes
- **Anonymous requests:** 20 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## Webhooks

### Stripe Webhooks

Configure your Stripe webhook endpoint:

**URL:** `https://api.eye-dentity.com/api/payments/webhook`

**Events to subscribe:**
- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.deleted`

---

## Testing

### Test Mode

Use Stripe test mode for development:

**Test Card:** `4242 4242 4242 4242`  
**Expiry:** Any future date  
**CVC:** Any 3 digits

### Test API Keys

Development API keys are prefixed with `test_` or `sk_test_`.

---

**Last Updated:** December 2024  
**API Version:** 1.0.0
