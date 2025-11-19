import { prisma } from '../lib/prisma';
import { sendDailyReport } from './telegram.service';
import { sendEmail } from './email.service';

export interface DailyReportData {
  date: string;
  totalUsers: number;
  newSignups: number;
  activeWebsites: number;
  totalOrders: number;
  completedOrders: number;
  revenue: number;
  failedDeployments: number;
}

/**
 * Generate daily report
 */
export const generateDailyReport = async (date?: Date): Promise<DailyReportData> => {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get total users
  const totalUsers = await prisma.user.count();

  // Get new signups today
  const newSignups = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Get active websites
  const activeWebsites = await prisma.website.count({
    where: {
      status: 'LIVE',
    },
  });

  // Get total orders
  const totalOrders = await prisma.order.count();

  // Get completed orders
  const completedOrders = await prisma.order.count({
    where: {
      status: 'COMPLETED',
    },
  });

  // Calculate revenue
  const revenueData = await prisma.order.aggregate({
    where: {
      status: 'COMPLETED',
      completedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // Get failed deployments
  const failedDeployments = await prisma.website.count({
    where: {
      status: 'ERROR',
      updatedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const report: DailyReportData = {
    date: targetDate.toISOString().split('T')[0],
    totalUsers,
    newSignups,
    activeWebsites,
    totalOrders,
    completedOrders,
    revenue: revenueData._sum.totalAmount || 0,
    failedDeployments,
  };

  // Store report in database
  await prisma.dailyReport.create({
    data: {
      date: startOfDay,
      totalUsers,
      newSignups,
      activeWebsites,
      revenue: report.revenue,
      metrics: report as any,
    },
  });

  console.log(`✅ Daily report generated for ${report.date}`);
  return report;
};

/**
 * Send daily report via multiple channels
 */
export const sendDailyReportNotifications = async (report: DailyReportData): Promise<void> => {
  // Send via Telegram
  await sendDailyReport({
    date: report.date,
    newUsers: report.newSignups,
    newOrders: report.completedOrders,
    revenue: report.revenue,
    activeWebsites: report.activeWebsites,
    failedDeployments: report.failedDeployments,
  });

  // Send via Email
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eye-dentity.com';
  await sendEmail({
    to: adminEmail,
    subject: `Daily Report - ${report.date}`,
    html: generateDailyReportEmailHTML(report),
    text: generateDailyReportEmailText(report),
  });

  console.log(`✅ Daily report sent for ${report.date}`);
};

/**
 * Generate HTML email for daily report
 */
function generateDailyReportEmailHTML(report: DailyReportData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .metric-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .metric-value { font-size: 32px; font-weight: bold; color: #1f2937; }
    .metric-label { font-size: 14px; color: #6b7280; text-transform: uppercase; }
    .revenue { border-left-color: #10b981; }
    .revenue .metric-value { color: #10b981; }
    .error { border-left-color: #ef4444; }
    .error .metric-value { color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Report</h1>
      <p>${report.date}</p>
    </div>
    <div class="content">
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${report.totalUsers}</div>
          <div class="metric-label">Total Users</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${report.newSignups}</div>
          <div class="metric-label">New Signups</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${report.activeWebsites}</div>
          <div class="metric-label">Active Websites</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${report.completedOrders}</div>
          <div class="metric-label">Orders Today</div>
        </div>
        <div class="metric-card revenue">
          <div class="metric-value">$${report.revenue.toFixed(2)}</div>
          <div class="metric-label">Revenue Today</div>
        </div>
        ${report.failedDeployments > 0 ? `
        <div class="metric-card error">
          <div class="metric-value">${report.failedDeployments}</div>
          <div class="metric-label">Failed Deployments</div>
        </div>
        ` : ''}
      </div>
      <p style="text-align: center; margin-top: 30px; color: #6b7280;">
        Have a great day! 🎉
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email for daily report
 */
function generateDailyReportEmailText(report: DailyReportData): string {
  return `
Daily Report - ${report.date}

Total Users: ${report.totalUsers}
New Signups: ${report.newSignups}
Active Websites: ${report.activeWebsites}
Orders Today: ${report.completedOrders}
Revenue Today: $${report.revenue.toFixed(2)}
${report.failedDeployments > 0 ? `Failed Deployments: ${report.failedDeployments}` : ''}

Have a great day!
  `.trim();
}

/**
 * Schedule daily report (to be called by cron job)
 */
export const scheduleDailyReport = async (): Promise<void> => {
  console.log('📊 Generating daily report...');

  try {
    const report = await generateDailyReport();
    await sendDailyReportNotifications(report);
    console.log('✅ Daily report completed');
  } catch (error: any) {
    console.error('❌ Failed to generate daily report:', error.message);
  }
};

/**
 * Get historical reports
 */
export const getHistoricalReports = async (days: number = 30): Promise<any[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const reports = await prisma.dailyReport.findMany({
    where: {
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return reports;
};
