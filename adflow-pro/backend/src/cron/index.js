/**
 * CRON Jobs Orchestrator
 * Handles scheduled tasks for AdFlow Pro
 * 
 * Jobs:
 * 1. Publish Scheduled Ads (Every 5 minutes - 0 */5 * * * *)
 * 2. Expire Ads Automatically (Daily at 2 AM - 0 2 * * *)
 * 3. Send Expiry Notifications (Daily at 8 AM - 0 8 * * *)
 * 4. System Health Logger (Every 1 hour - 0 * * * *)
 */

import cron from 'node-cron';
import supabase from '../config/database.js';
import * as adServiceAdvanced from '../services/ad.service.advanced.js';
import * as notificationService from '../services/notification.service.js';

// Flag to prevent concurrent execution of same job
const jobLocks = {
  publishScheduled: false,
  expireAds: false,
  sendNotifications: false,
  healthCheck: false
};

/**
 * ============================================
 * JOB 1: Publish Scheduled Ads
 * ============================================
 * Cron Expression: 0 */5 * * * * (Every 5 minutes)
 * Publishes ads that:
 * - Are in 'awaiting_payment' status
 * - Payment has been verified
 * - Scheduled publish time has arrived
 */
const publishScheduledAds = async () => {
  if (jobLocks.publishScheduled) return; // Skip if already running
  jobLocks.publishScheduled = true;
  const jobStartTime = new Date();

  try {
    console.log(`\n📤 [${jobStartTime.toISOString()}] Publishing scheduled ads...`);

    // Get all ads awaiting payment with verified payment
    const { data: adsToPublish, error: fetchError } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'awaiting_payment')
      .eq('payment_verified', true)
      .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`);

    if (fetchError) throw fetchError;

    if (!adsToPublish || adsToPublish.length === 0) {
      console.log('ℹ️  No ads to publish at this time');
      logHealthEvent('publishScheduledAds', 'completed', { adsPublished: 0 });
      return;
    }

    let publishedCount = 0;
    let failedCount = 0;
    const failedAdIds = [];

    // Publish each ad
    for (const ad of adsToPublish) {
      try {
        // Calculate expiry (30 days from now by default, or based on package)
        const expiryDays = getPackageExpiryDays(ad.package_type);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        // Update ad to published status
        const { data: updatedAd, error: updateError } = await supabase
          .from('ads')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            expires_at: expiryDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', ad.id)
          .select();

        if (updateError) throw updateError;

        // Add status history record
        await supabase
          .from('ad_status_history')
          .insert({
            ad_id: ad.id,
            from_status: ad.status,
            to_status: 'published',
            reason: 'Payment verified - auto published',
            created_at: new Date().toISOString()
          });

        publishedCount++;

        // Send notification to user
        await notificationService.sendPublishedNotification(ad.user_id, {
          adId: ad.id,
          adTitle: ad.title,
          expiryDate: expiryDate.toISOString()
        });

        console.log(`  ✓ Ad ${ad.id} published (expires: ${expiryDate.toLocaleDateString()})`);
      } catch (adError) {
        console.error(`  ✗ Failed to publish ad ${ad.id}:`, adError.message);
        failedCount++;
        failedAdIds.push(ad.id);
      }
    }

    const jobEndTime = new Date();
    const duration = jobEndTime - jobStartTime;

    console.log(`✓ Completed in ${duration}ms | Published: ${publishedCount} | Failed: ${failedCount}`);

    // Log health event
    logHealthEvent('publishScheduledAds', 'completed', {
      adsPublished: publishedCount,
      adsFailed: failedCount,
      failedAdIds,
      duration
    });
  } catch (error) {
    console.error('❌ Publish scheduled ads job failed:', error);
    logHealthEvent('publishScheduledAds', 'failed', {
      error: error.message,
      duration: new Date() - jobStartTime
    });
  } finally {
    jobLocks.publishScheduled = false;
  }
};

/**
 * ============================================
 * JOB 2: Expire Ads Automatically
 * ============================================
 * Cron Expression: 0 2 * * * (Daily at 2 AM)
 * Expires ads that:
 * - Have expires_at date in the past
 * - Are currently in 'published' or 'paused' status
 * - Haven't been marked as expired yet
 */
const expireAdsAutomatically = async () => {
  if (jobLocks.expireAds) return; // Skip if already running
  jobLocks.expireAds = true;
  const jobStartTime = new Date();

  try {
    console.log(`\n⏰ [${jobStartTime.toISOString()}] Expiring old ads...`);

    // Call the advanced ad service method
    const result = await adServiceAdvanced.expireOldAds(supabase);

    if (!result || result.expiredCount === 0) {
      console.log('ℹ️  No ads to expire at this time');
      logHealthEvent('expireAdsAutomatically', 'completed', { adsExpired: 0 });
      return;
    }

    console.log(`✓ Expired ${result.expiredCount} ads | Failed: ${result.failedCount}`);

    // Log health event
    logHealthEvent('expireAdsAutomatically', 'completed', {
      adsExpired: result.expiredCount,
      adsFailed: result.failedCount,
      duration: new Date() - jobStartTime
    });
  } catch (error) {
    console.error('❌ Expire ads job failed:', error);
    logHealthEvent('expireAdsAutomatically', 'failed', {
      error: error.message,
      duration: new Date() - jobStartTime
    });
  } finally {
    jobLocks.expireAds = false;
  }
};

/**
 * ============================================
 * JOB 3: Send Expiry Notifications
 * ============================================
 * Cron Expression: 0 8 * * * (Daily at 8 AM)
 * Sends notifications for:
 * - Ads expiring in next 7 days
 * - Ads expiring in next 3 days (reminder)
 * - Ads that just expired
 */
const sendExpiryNotifications = async () => {
  if (jobLocks.sendNotifications) return; // Skip if already running
  jobLocks.sendNotifications = true;
  const jobStartTime = new Date();

  try {
    console.log(`\n📬 [${jobStartTime.toISOString()}] Sending expiry notifications...`);

    // Get ads expiring in next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringAds, error: fetchError } = await supabase
      .from('ads')
      .select('*, users:user_id(email, name)')
      .eq('status', 'published')
      .gt('expires_at', new Date().toISOString())
      .lte('expires_at', sevenDaysFromNow.toISOString());

    if (fetchError) throw fetchError;

    if (!expiringAds || expiringAds.length === 0) {
      console.log('ℹ️  No ads expiring soon');
      logHealthEvent('sendExpiryNotifications', 'completed', { notificationsSent: 0 });
      return;
    }

    let notificationsSent = 0;
    let notificationsFailed = 0;

    // Group by urgency
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    for (const ad of expiringAds) {
      try {
        const expiryDate = new Date(ad.expires_at);
        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

        let notificationType = 'expiring_soon'; // 4-7 days
        if (daysUntilExpiry <= 1) {
          notificationType = 'expiring_today';
        } else if (daysUntilExpiry <= 3) {
          notificationType = 'expiring_very_soon';
        }

        // Send notification based on type
        await notificationService.sendExpiryNotification(ad.user_id, {
          adId: ad.id,
          adTitle: ad.title,
          expiryDate: ad.expires_at,
          daysUntilExpiry,
          type: notificationType
        });

        notificationsSent++;
        console.log(`  ✓ Notification sent for ad ${ad.id} (expires in ${daysUntilExpiry} days)`);
      } catch (notifError) {
        console.error(`  ✗ Failed to send notification for ad ${ad.id}:`, notifError.message);
        notificationsFailed++;
      }
    }

    const jobEndTime = new Date();
    const duration = jobEndTime - jobStartTime;

    console.log(`✓ Completed in ${duration}ms | Sent: ${notificationsSent} | Failed: ${notificationsFailed}`);

    // Log health event
    logHealthEvent('sendExpiryNotifications', 'completed', {
      notificationsSent,
      notificationsFailed,
      duration
    });
  } catch (error) {
    console.error('❌ Send notifications job failed:', error);
    logHealthEvent('sendExpiryNotifications', 'failed', {
      error: error.message,
      duration: new Date() - jobStartTime
    });
  } finally {
    jobLocks.sendNotifications = false;
  }
};

/**
 * ============================================
 * JOB 4: System Health Logger
 * ============================================
 * Cron Expression: 0 * * * * (Every hour)
 * Logs system health metrics:
 * - Server uptime
 * - Total ads in system
 * - Published ads count
 * - Expired ads count
 * - System memory usage
 * 
 * Stores logs in:
 * - Console (immediate visibility)
 * - cron_health_logs table (historical tracking)
 */
const logSystemHealth = async () => {
  if (jobLocks.healthCheck) return; // Skip if already running
  jobLocks.healthCheck = true;
  const jobStartTime = new Date();

  try {
    console.log(`\n💚 [${jobStartTime.toISOString()}] System health check...`);

    // Get system metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Get ad statistics
    const { data: adStats, error: statsError } = await supabase.rpc('get_ad_statistics');

    if (statsError) throw statsError;

    const stats = adStats?.[0] || {};

    const healthLog = {
      timestamp: jobStartTime.toISOString(),
      uptime_seconds: Math.floor(uptime),
      memory_heap_used_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      memory_heap_total_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      memory_heap_used_percent: Math.round(heapUsedPercent * 100) / 100,
      ads_total: stats.total_ads || 0,
      ads_published: stats.published_ads || 0,
      ads_expired: stats.expired_ads || 0,
      ads_draft: stats.draft_ads || 0,
      users_total: stats.total_users || 0,
      node_version: process.version,
      status: heapUsedPercent > 90 ? 'warning' : 'healthy'
    };

    // Insert into database
    const { error: insertError } = await supabase
      .from('cron_health_logs')
      .insert(healthLog);

    if (insertError) {
      console.warn('⚠️  Could not save health log to database:', insertError.message);
    }

    // Log to console
    console.log('  📊 Metrics:');
    console.log(`    • Uptime: ${formatUptime(uptime)}`);
    console.log(`    • Memory: ${healthLog.memory_heap_used_mb}MB / ${healthLog.memory_heap_total_mb}MB (${healthLog.memory_heap_used_percent}%)`);
    console.log(`    • Ads: ${healthLog.ads_total} total | ${healthLog.ads_published} published | ${healthLog.ads_expired} expired`);
    console.log(`    • Status: ${healthLog.status.toUpperCase()}`);

    if (heapUsedPercent > 90) {
      console.warn('⚠️  WARNING: High memory usage detected!');
    }

    logHealthEvent('logSystemHealth', 'completed', {
      uptime: Math.floor(uptime),
      memoryHeapUsedPercent: healthLog.memory_heap_used_percent,
      adsCount: healthLog.ads_total,
      duration: new Date() - jobStartTime
    });
  } catch (error) {
    console.error('❌ Health check job failed:', error);
    logHealthEvent('logSystemHealth', 'failed', {
      error: error.message,
      duration: new Date() - jobStartTime
    });
  } finally {
    jobLocks.healthCheck = false;
  }
};

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Log health event to system logs
 * @param {string} jobName - Name of the job
 * @param {string} status - 'started', 'completed', 'failed'
 * @param {Object} metadata - Additional metadata
 */
const logHealthEvent = (jobName, status, metadata = {}) => {
  try {
    const event = {
      timestamp: new Date().toISOString(),
      job_name: jobName,
      status,
      metadata: JSON.stringify(metadata),
      created_at: new Date().toISOString()
    };

    // Log to cron_job_logs table asynchronously (don't await)
    supabase
      .from('cron_job_logs')
      .insert(event)
      .catch(err => console.warn('Could not log job event:', err.message));
  } catch (error) {
    console.warn('Error logging health event:', error.message);
  }
};

/**
 * Get package expiry days
 * @param {string} packageType - 'basic', 'standard', 'premium', 'featured'
 * @returns {number} Days until expiry
 */
const getPackageExpiryDays = (packageType) => {
  const expiryMap = {
    basic: 14,
    standard: 30,
    premium: 60,
    featured: 90,
    platinum: 180
  };
  return expiryMap[packageType] || 30;
};

/**
 * Format uptime to readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * ============================================
 * CRON JOB INITIALIZATION
 * ============================================
 * Initialize all cron jobs when module loads
 */

export const initializeCronJobs = () => {
  console.log('\n🚀 Initializing CRON Jobs...\n');

  try {
    // Job 1: Publish Scheduled Ads (Every 5 minutes)
    const publishJob = cron.schedule('0 */5 * * * *', publishScheduledAds);
    console.log('✓ Scheduled: Publish Ads (every 5 minutes)');

    // Job 2: Expire Ads (Daily at 2 AM)
    const expireJob = cron.schedule('0 2 * * *', expireAdsAutomatically);
    console.log('✓ Scheduled: Expire Ads (daily at 2:00 AM)');

    // Job 3: Send Notifications (Daily at 8 AM)
    const notifyJob = cron.schedule('0 8 * * *', sendExpiryNotifications);
    console.log('✓ Scheduled: Send Notifications (daily at 8:00 AM)');

    // Job 4: Health Logger (Every hour)
    const healthJob = cron.schedule('0 * * * *', logSystemHealth);
    console.log('✓ Scheduled: Health Logger (every hour)');

    console.log('\n✅ All CRON jobs initialized successfully!\n');

    return {
      publishJob,
      expireJob,
      notifyJob,
      healthJob
    };
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error);
    process.exit(1);
  }
};

/**
 * ============================================
 * MANUAL JOB EXECUTION (For Testing)
 * ============================================
 */

export const manualTriggers = {
  publishScheduledAds,
  expireAdsAutomatically,
  sendExpiryNotifications,
  logSystemHealth
};

export default {
  initializeCronJobs,
  manualTriggers
};
