import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@eye-dentity.com';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via SendGrid
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!SENDGRID_API_KEY) {
    console.log('📧 Mock: Sending email');
    console.log(`   To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   ✅ Email sent (mock mode)`);
    return true;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    });

    console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send email:', error.response?.body || error.message);
    return false;
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<boolean> => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Eye-Dentity! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Thank you for joining Eye-Dentity! We're excited to help you create your professional AI-powered website.</p>
      <p><strong>What's next?</strong></p>
      <ul>
        <li>Complete your profile information</li>
        <li>Choose your template and color scheme</li>
        <li>Select your domain and hosting plan</li>
        <li>Let our AI generate your perfect website!</li>
      </ul>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/builder" class="button">Start Building Your Website</a>
      <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
      <p>Best regards,<br>The Eye-Dentity Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eye-Dentity. All rights reserved.</p>
      <p>You're receiving this email because you created an account at Eye-Dentity.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Eye-Dentity - Let\'s Build Your Website!',
    html,
    text: `Hi ${userName}, Welcome to Eye-Dentity! Start building your website at ${process.env.FRONTEND_URL}/builder`,
  });
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  userEmail: string,
  userName: string,
  orderDetails: {
    orderId: string;
    domain: string;
    hostingPlan: string;
    totalAmount: number;
  }
): Promise<boolean> => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .order-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .total { font-weight: bold; font-size: 18px; color: #10b981; }
    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Thank you for your order! We're now generating your AI-powered website.</p>

      <div class="order-details">
        <h3>Order Details</h3>
        <div class="order-row">
          <span>Order ID:</span>
          <span>${orderDetails.orderId}</span>
        </div>
        <div class="order-row">
          <span>Domain:</span>
          <span><strong>${orderDetails.domain}</strong></span>
        </div>
        <div class="order-row">
          <span>Hosting Plan:</span>
          <span>${orderDetails.hostingPlan.toUpperCase()}</span>
        </div>
        <div class="order-row total">
          <span>Total Paid:</span>
          <span>$${orderDetails.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <p><strong>What happens next?</strong></p>
      <ol>
        <li>Our AI is generating your website content (5-10 minutes)</li>
        <li>Your website will be deployed automatically</li>
        <li>You'll receive another email when it's live!</li>
      </ol>

      <p>You can track your website's progress in your dashboard.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">View Dashboard</a>

      <p>Best regards,<br>The Eye-Dentity Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eye-Dentity. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Order Confirmed - ${orderDetails.domain} is Being Generated!`,
    html,
    text: `Hi ${userName}, Your order for ${orderDetails.domain} has been confirmed! Total: $${orderDetails.totalAmount.toFixed(2)}`,
  });
};

/**
 * Send website live notification email
 */
export const sendWebsiteLiveEmail = async (
  userEmail: string,
  userName: string,
  websiteDetails: {
    domain: string;
    deploymentUrl: string;
  }
): Promise<boolean> => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .website-card { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px solid #8b5cf6; }
    .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Your Website is Live!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Great news! Your website is now live and ready to share with the world!</p>

      <div class="website-card">
        <h2>${websiteDetails.domain}</h2>
        <p>Your professional AI-powered website is now accessible at:</p>
        <a href="${websiteDetails.deploymentUrl}" class="button">Visit Your Website 🌐</a>
      </div>

      <p><strong>Next steps:</strong></p>
      <ul>
        <li>Review your website and make sure everything looks perfect</li>
        <li>Share your website link on social media</li>
        <li>Update your email signature with your new website</li>
        <li>Start driving traffic to grow your online presence</li>
      </ul>

      <p>Need to make changes? You can regenerate your website anytime from your dashboard.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Manage Website</a>

      <p>Congratulations on your new website!</p>
      <p>Best regards,<br>The Eye-Dentity Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eye-Dentity. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `🎉 ${websiteDetails.domain} is Live!`,
    html,
    text: `Hi ${userName}, Your website ${websiteDetails.domain} is now live! Visit it at: ${websiteDetails.deploymentUrl}`,
  });
};

/**
 * Send admin notification for new order
 */
export const sendAdminOrderNotification = async (
  orderDetails: {
    orderId: string;
    userEmail: string;
    domain: string;
    hostingPlan: string;
    totalAmount: number;
  }
): Promise<boolean> => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eye-dentity.com';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; }
    .content { background: #f9f9f9; padding: 20px; }
    .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔔 New Order Received</h2>
    </div>
    <div class="content">
      <div class="order-details">
        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Customer:</strong> ${orderDetails.userEmail}</p>
        <p><strong>Domain:</strong> ${orderDetails.domain}</p>
        <p><strong>Plan:</strong> ${orderDetails.hostingPlan.toUpperCase()}</p>
        <p><strong>Amount:</strong> $${orderDetails.totalAmount.toFixed(2)}</p>
      </div>
      <p>Website generation has been initiated automatically.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Order: ${orderDetails.domain} ($${orderDetails.totalAmount.toFixed(2)})`,
    html,
    text: `New order from ${orderDetails.userEmail} for ${orderDetails.domain}. Amount: $${orderDetails.totalAmount.toFixed(2)}`,
  });
};

/**
 * Check if SendGrid is configured
 */
export const isSendGridConfigured = (): boolean => {
  return !!SENDGRID_API_KEY && SENDGRID_API_KEY.length > 0;
};
