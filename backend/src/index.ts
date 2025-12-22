import './config/env'; // Must be first
import express, { Express, Request, Response } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// dotenv config is handled in ./config/env
import rateLimit from 'express-rate-limit';
import path from 'path';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import templateRoutes from './routes/template.routes';
import uploadRoutes from './routes/upload.routes';
import domainRoutes from './routes/domain.routes';
import hostingRoutes from './routes/hosting.routes';
import paymentRoutes from './routes/payment.routes';
import websiteRoutes from './routes/website.routes';
import adminRoutes from './routes/admin.routes';
import exportRoutes from './routes/export.routes';
import marketingRoutes from './routes/marketing.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import chatRoutes from './routes/chat.routes';
import settingsRoutes from './routes/settings.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS

// IMPORTANT: Stripe webhook needs raw body - must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging
app.use('/api/', limiter); // Rate limiting for API routes

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Serve template preview images
app.use('/templates', express.static(path.join(__dirname, '../public/templates')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'eye-dentity-api'
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Eye-Dentity API Server',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    }
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Eye-Dentity API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/hosting', hostingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
