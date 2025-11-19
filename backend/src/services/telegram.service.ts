import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

let bot: TelegramBot | null = null;

// Initialize Telegram Bot
if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}

/**
 * Send Telegram message
 */
export const sendTelegramMessage = async (message: string, chatId?: string): Promise<boolean> => {
  const targetChatId = chatId || TELEGRAM_ADMIN_CHAT_ID;

  if (!bot || !targetChatId) {
    console.log('📱 Mock: Sending Telegram message');
    console.log(`   To: ${targetChatId || 'admin'}`);
    console.log(`   Message: ${message}`);
    console.log('   ✅ Message sent (mock mode)');
    return true;
  }

  try {
    await bot.sendMessage(targetChatId, message, { parse_mode: 'HTML' });
    console.log(`✅ Telegram message sent to ${targetChatId}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send Telegram message:', error.message);
    return false;
  }
};

/**
 * Send new order notification to admin
 */
export const sendOrderNotification = async (orderDetails: {
  orderId: string;
  userEmail: string;
  userName: string | null;
  domain: string;
  hostingPlan: string;
  totalAmount: number;
}): Promise<boolean> => {
  const message = `
🎉 <b>New Order Received!</b>

📧 Customer: ${orderDetails.userName || orderDetails.userEmail}
🌐 Domain: <code>${orderDetails.domain}</code>
📦 Plan: <b>${orderDetails.hostingPlan.toUpperCase()}</b>
💰 Amount: <b>$${orderDetails.totalAmount.toFixed(2)}</b>

🆔 Order ID: <code>${orderDetails.orderId}</code>

⏳ Website generation is now in progress...
  `.trim();

  return sendTelegramMessage(message);
};

/**
 * Send website live notification to admin
 */
export const sendWebsiteLiveNotification = async (websiteDetails: {
  domain: string;
  userEmail: string;
  deploymentUrl: string;
}): Promise<boolean> => {
  const message = `
🚀 <b>Website is Live!</b>

🌐 Domain: <code>${websiteDetails.domain}</code>
👤 User: ${websiteDetails.userEmail}
🔗 URL: ${websiteDetails.deploymentUrl}

✅ Website successfully deployed and accessible!
  `.trim();

  return sendTelegramMessage(message);
};

/**
 * Send deployment error notification
 */
export const sendDeploymentErrorNotification = async (errorDetails: {
  domain: string;
  userEmail: string;
  error: string;
}): Promise<boolean> => {
  const message = `
⚠️ <b>Deployment Error!</b>

🌐 Domain: <code>${errorDetails.domain}</code>
👤 User: ${errorDetails.userEmail}
❌ Error: ${errorDetails.error}

⚠️ Manual intervention may be required.
  `.trim();

  return sendTelegramMessage(message);
};

/**
 * Send daily report to admin
 */
export const sendDailyReport = async (report: {
  date: string;
  newUsers: number;
  newOrders: number;
  revenue: number;
  activeWebsites: number;
  failedDeployments: number;
}): Promise<boolean> => {
  const message = `
📊 <b>Daily Report - ${report.date}</b>

👥 New Users: <b>${report.newUsers}</b>
📦 New Orders: <b>${report.newOrders}</b>
💰 Revenue: <b>$${report.revenue.toFixed(2)}</b>
🌐 Active Websites: <b>${report.activeWebsites}</b>
${report.failedDeployments > 0 ? `⚠️ Failed Deployments: <b>${report.failedDeployments}</b>` : '✅ No Failed Deployments'}

Have a great day! 🎉
  `.trim();

  return sendTelegramMessage(message);
};

/**
 * Send critical error alert
 */
export const sendCriticalErrorAlert = async (error: {
  service: string;
  message: string;
  stack?: string;
}): Promise<boolean> => {
  const message = `
🚨 <b>CRITICAL ERROR</b>

⚙️ Service: <code>${error.service}</code>
❌ Error: ${error.message}

${error.stack ? `Stack: <code>${error.stack.substring(0, 500)}</code>` : ''}

⚠️ Immediate attention required!
  `.trim();

  return sendTelegramMessage(message);
};

/**
 * Send new user welcome notification (to admin)
 */
export const sendNewUserNotification = async (userDetails: {
  name: string | null;
  email: string;
  profession?: string;
}): Promise<boolean> => {
  const message = `
👋 <b>New User Signup!</b>

👤 Name: ${userDetails.name || 'Not provided'}
📧 Email: ${userDetails.email}
${userDetails.profession ? `💼 Profession: ${userDetails.profession}` : ''}

🎉 Welcome to Eye-Dentity!
  `.trim();

  return sendTelegramMessage(message);
};

/**
 * Check if Telegram is configured
 */
export const isTelegramConfigured = (): boolean => {
  return !!(TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID);
};

/**
 * Test Telegram connection
 */
export const testTelegramConnection = async (): Promise<boolean> => {
  if (!bot) {
    console.log('Telegram bot not configured');
    return false;
  }

  try {
    const me = await bot.getMe();
    console.log(`✅ Telegram bot connected: @${me.username}`);
    return true;
  } catch (error: any) {
    console.error('Failed to connect to Telegram:', error.message);
    return false;
  }
};
