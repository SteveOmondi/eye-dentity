import { prisma } from '../lib/prisma';
import os from 'os';

/**
 * System Health Monitoring Service
 *
 * Monitors system health metrics and provides real-time status
 */

export interface HealthMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  apiResponseTime: number;
  errorRate: number;
  activeUsers: number;
  activeWebsites: number;
  queuedJobs: number;
  failedJobs: number;
  databaseStatus: string;
  redisStatus: string;
  storageStatus: string;
  overallStatus: string;
  alerts: any[];
}

/**
 * Get current CPU usage percentage
 */
const getCPUUsage = (): number => {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += (cpu.times as any)[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - (100 * idle / total);

  return Math.round(usage * 10) / 10;
};

/**
 * Get current memory usage percentage
 */
const getMemoryUsage = (): number => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const usage = (usedMemory / totalMemory) * 100;

  return Math.round(usage * 10) / 10;
};

/**
 * Get disk usage (mock implementation - would need actual disk monitoring)
 */
const getDiskUsage = (): number => {
  // In production, this would use a library like 'node-disk-info' or 'diskusage'
  // For now, return a mock value
  return Math.round((Math.random() * 30 + 40) * 10) / 10; // 40-70%
};

/**
 * Check database health
 */
const checkDatabaseHealth = async (): Promise<string> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'down';
  }
};

/**
 * Check Redis health (mock - would need actual Redis connection)
 */
const checkRedisHealth = async (): Promise<string> => {
  // In production, this would check actual Redis connection
  // For now, assume healthy
  return 'healthy';
};

/**
 * Check storage health (mock - would check S3 or file system)
 */
const checkStorageHealth = async (): Promise<string> => {
  // In production, this would check S3 or file system
  // For now, assume healthy
  return 'healthy';
};

/**
 * Get active users count (users active in last 15 minutes)
 */
const getActiveUsers = async (): Promise<number> => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  // This would typically check last login/activity timestamp
  // For now, return a count based on recent activity
  const activeCount = await prisma.user.count({
    where: {
      updatedAt: {
        gte: fifteenMinutesAgo,
      },
    },
  });

  return activeCount;
};

/**
 * Get active websites count
 */
const getActiveWebsites = async (): Promise<number> => {
  return prisma.website.count({
    where: {
      status: 'LIVE',
    },
  });
};

/**
 * Calculate API error rate (mock - would need actual request tracking)
 */
const calculateErrorRate = (): number => {
  // In production, this would track actual request/error counts
  // For now, return a low mock value
  return Math.round((Math.random() * 2) * 100) / 100; // 0-2%
};

/**
 * Calculate average API response time (mock - would need actual tracking)
 */
const calculateApiResponseTime = (): number => {
  // In production, this would track actual response times
  // For now, return a mock value between 50-200ms
  return Math.round((Math.random() * 150 + 50) * 10) / 10;
};

/**
 * Collect system health metrics
 */
export const collectHealthMetrics = async (): Promise<HealthMetrics> => {
  const [
    databaseStatus,
    redisStatus,
    storageStatus,
    activeUsers,
    activeWebsites,
  ] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
    checkStorageHealth(),
    getActiveUsers(),
    getActiveWebsites(),
  ]);

  const cpuUsage = getCPUUsage();
  const memoryUsage = getMemoryUsage();
  const diskUsage = getDiskUsage();
  const errorRate = calculateErrorRate();
  const apiResponseTime = calculateApiResponseTime();

  // Determine overall status
  const alerts: any[] = [];
  let overallStatus = 'healthy';

  if (databaseStatus === 'down') {
    overallStatus = 'down';
    alerts.push({
      level: 'critical',
      message: 'Database is down',
      timestamp: new Date(),
    });
  } else if (cpuUsage > 90 || memoryUsage > 90) {
    overallStatus = 'degraded';
    alerts.push({
      level: 'warning',
      message: 'High resource usage detected',
      timestamp: new Date(),
    });
  } else if (errorRate > 5) {
    overallStatus = 'degraded';
    alerts.push({
      level: 'warning',
      message: 'High error rate detected',
      timestamp: new Date(),
    });
  }

  return {
    cpuUsage,
    memoryUsage,
    diskUsage,
    apiResponseTime,
    errorRate,
    activeUsers,
    activeWebsites,
    queuedJobs: 0, // Would track actual job queue
    failedJobs: 0, // Would track actual failed jobs
    databaseStatus,
    redisStatus,
    storageStatus,
    overallStatus,
    alerts,
  };
};

/**
 * Record health metrics to database
 */
export const recordHealthMetrics = async (): Promise<void> => {
  const metrics = await collectHealthMetrics();

  await prisma.systemHealth.create({
    data: {
      timestamp: new Date(),
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsage,
      diskUsage: metrics.diskUsage,
      apiResponseTime: metrics.apiResponseTime,
      errorRate: metrics.errorRate,
      activeUsers: metrics.activeUsers,
      activeWebsites: metrics.activeWebsites,
      queuedJobs: metrics.queuedJobs,
      failedJobs: metrics.failedJobs,
      databaseStatus: metrics.databaseStatus,
      redisStatus: metrics.redisStatus,
      storageStatus: metrics.storageStatus,
      overallStatus: metrics.overallStatus,
      alerts: metrics.alerts,
    },
  });

  // Clean up old records (keep last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await prisma.systemHealth.deleteMany({
    where: {
      timestamp: {
        lt: sevenDaysAgo,
      },
    },
  });
};

/**
 * Get health history
 */
export const getHealthHistory = async (hours: number = 24) => {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  return prisma.systemHealth.findMany({
    where: {
      timestamp: {
        gte: startTime,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });
};

/**
 * Get current system status
 */
export const getCurrentStatus = async () => {
  const metrics = await collectHealthMetrics();

  return {
    status: metrics.overallStatus,
    timestamp: new Date(),
    metrics: {
      cpu: metrics.cpuUsage,
      memory: metrics.memoryUsage,
      disk: metrics.diskUsage,
      responseTime: metrics.apiResponseTime,
      errorRate: metrics.errorRate,
    },
    services: {
      database: metrics.databaseStatus,
      redis: metrics.redisStatus,
      storage: metrics.storageStatus,
    },
    activity: {
      activeUsers: metrics.activeUsers,
      activeWebsites: metrics.activeWebsites,
      queuedJobs: metrics.queuedJobs,
      failedJobs: metrics.failedJobs,
    },
    alerts: metrics.alerts,
  };
};

/**
 * Get system uptime
 */
export const getSystemUptime = () => {
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  return {
    seconds: uptime,
    formatted: `${days}d ${hours}h ${minutes}m`,
    days,
    hours,
    minutes,
  };
};

/**
 * Get system information
 */
export const getSystemInfo = () => {
  return {
    platform: os.platform(),
    type: os.type(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: getSystemUptime(),
    nodeVersion: process.version,
  };
};

/**
 * Check if alerts should be sent
 */
export const checkAlerts = async (): Promise<boolean> => {
  const metrics = await collectHealthMetrics();

  // Send alert if system is degraded or down
  if (metrics.overallStatus !== 'healthy') {
    console.error('System health alert:', metrics.alerts);
    // In production, this would send notifications via email/Telegram/Slack
    return true;
  }

  return false;
};
