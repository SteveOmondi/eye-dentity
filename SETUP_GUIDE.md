# Setup Guide - Dual-Mode Profile Builder

## Prerequisites
- PostgreSQL database running
- Node.js installed
- Backend and frontend dependencies installed

## Step 1: Environment Configuration

### Generate Encryption Key
Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Update .env File
Copy `.env.example` to `.env` if you haven't already:

```bash
cd backend
cp .env.example .env
```

Then update the following variables in `backend/.env`:

```env
# Add the encryption key you generated
ENCRYPTION_KEY=<paste-your-64-character-hex-string-here>

# Make sure these are set
ANTHROPIC_API_KEY=<your-claude-api-key>
OPENAI_API_KEY=<your-openai-api-key>
DATABASE_URL=<your-postgresql-connection-string>
```

## Step 2: Database Migration

Run the Prisma migration to create the new tables:

```bash
cd backend
npx prisma migrate dev --name add_chat_and_apikey_models
```

This will:
- Create the `ChatSession` table
- Create the `ApiKey` table
- Update the `User` table with new relations
- Generate the Prisma client

If the migration asks for confirmation, type `y` and press Enter.

## Step 3: Generate Prisma Client

If the client wasn't generated automatically:

```bash
npx prisma generate
```

## Step 4: Verify Migration

Check that the tables were created:

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can see:
- `ChatSession` table
- `ApiKey` table
- Updated `User` table

## Step 5: Start the Backend

```bash
npm run dev
```

The backend should start without errors.

## Step 6: Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

## Step 7: Test the Implementation

### Test Mode Selector
1. Navigate to `http://localhost:5173`
2. You should see the mode selector screen
3. Try clicking on both "Chat Mode" and "Form Mode" cards

### Test Chat Mode
1. Select "Chat Mode"
2. The AI should greet you and ask a question
3. Type a response and press Enter
4. Verify the AI responds and extracts data
5. Check the progress bar updates
6. Expand the "Collected Information" section

### Test API Key Settings
1. In chat mode, click the "API Keys" button
2. Try adding a test API key
3. Test the connection
4. Save the key
5. Verify it appears in the saved keys list

### Test Mode Switching
1. While in chat mode (steps 1-2), click "Switch to Form"
2. Verify you're taken to the traditional form
3. Click "Switch to Chat" to go back

### Test Form Mode
1. Go back to mode selector (refresh page)
2. Select "Form Mode"
3. Fill out the personal info step
4. Proceed to bio/services step
5. Verify data is saved

## Troubleshooting

### Migration Fails
If migration fails, check:
- Database is running and accessible
- DATABASE_URL is correct in .env
- You have permissions to create tables

Try resetting the database:
```bash
npx prisma migrate reset
```

### Encryption Errors
If you see encryption errors:
- Verify ENCRYPTION_KEY is exactly 64 characters (hex)
- Make sure it's in .env file
- Restart the backend server

### API Key Test Fails
If API key testing fails:
- Verify the API key is valid
- Check your internet connection
- Ensure the provider is correct (Claude/OpenAI)

### Chat Not Working
If chat doesn't work:
- Check backend console for errors
- Verify ANTHROPIC_API_KEY or OPENAI_API_KEY is set
- Check browser console for errors
- Verify the chat API endpoints are accessible

## Database Schema

### ChatSession Table
```sql
CREATE TABLE "ChatSession" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "messages" JSONB DEFAULT '[]',
  "collectedData" JSONB DEFAULT '{}',
  "provider" TEXT DEFAULT 'claude',
  "mode" TEXT DEFAULT 'chat',
  "isComplete" BOOLEAN DEFAULT false,
  "completionProgress" INTEGER DEFAULT 0,
  "currentTopic" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "completedAt" TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
```

### ApiKey Table
```sql
CREATE TABLE "ApiKey" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "encryptedKey" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "lastUsed" TIMESTAMP,
  "usageCount" INTEGER DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE ("userId", "provider")
);
```

## API Endpoints

### Chat Endpoints
- `POST /api/chat/start` - Start new chat session
- `POST /api/chat/message` - Send message
- `GET /api/chat/session/:id` - Get session
- `GET /api/chat/sessions` - List user sessions
- `DELETE /api/chat/session/:id` - Delete session

### Settings Endpoints
- `POST /api/settings/api-keys` - Save API key
- `GET /api/settings/api-keys` - List API keys
- `DELETE /api/settings/api-keys/:provider` - Delete API key
- `POST /api/settings/api-keys/test` - Test API key

## Next Steps

After successful setup and testing:

1. **Deploy to Staging**
   - Set up staging database
   - Run migrations on staging
   - Deploy backend and frontend
   - Test end-to-end

2. **User Testing**
   - Invite beta users
   - Gather feedback
   - Monitor chat sessions
   - Track completion rates

3. **Production Deployment**
   - Set up production database
   - Configure environment variables
   - Run migrations
   - Deploy to production
   - Monitor performance

## Support

If you encounter issues:
1. Check the console logs (backend and frontend)
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check API keys are valid
5. Review the walkthrough.md for detailed implementation info
