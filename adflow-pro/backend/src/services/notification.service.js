/**
 * Notification Service
 * Handles sending notifications for ad-related events
 */

import nodemailer from 'nodemailer';
import supabase from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send published notification
 * Sent when an ad is published after payment verification
 */
export const sendPublishedNotification = async (userId, adData) => {
  try {
    // Get user email from database
    const { data: user, error } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.warn(`Could not find user ${userId} for notification`);
      return;
    }

    const expiryDate = new Date(adData.expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailContent = `
      <h2>Your Ad is Now Published! 🎉</h2>
      <p>Hi ${user.name},</p>
      <p>Great news! Your ad "<strong>${adData.adTitle}</strong>" has been successfully published and is now visible to all users.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ad Details:</strong></p>
        <p>Ad ID: ${adData.adId}</p>
        <p>Title: ${adData.adTitle}</p>
        <p>Expires on: <strong>${expiryDate}</strong></p>
      </div>

      <p><strong>What's next?</strong></p>
      <ul>
        <li>Your ad will be visible for the duration shown above</li>
        <li>You'll receive a notification 7 days before expiry</li>
        <li>Renew your ad anytime before it expires</li>
      </ul>

      <a href="${process.env.FRONTEND_URL}/dashboard/ads/${adData.adId}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Ad</a>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        AdFlow Pro - Your Sponsored Listings Platform
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Ad "${adData.adTitle}" is Now Published!`,
      html: emailContent
    });

    console.log(`✓ Published notification sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending published notification:', error);
    throw error;
  }
};

/**
 * Send expiry notification
 * Sent to notify users about upcoming or recent expiry
 */
export const sendExpiryNotification = async (userId, adData) => {
  try {
    // Get user email
    const { data: user, error } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.warn(`Could not find user ${userId} for expiry notification`);
      return;
    }

    let subject, heading, actionText, urgencyClass;

    if (adData.type === 'expiring_today') {
      subject = `⏰ URGENTITY: Your ad expires TODAY!`;
      heading = 'Your Ad Expires TODAY! ⏰';
      actionText = 'Renew Immediately';
      urgencyClass = 'red';
    } else if (adData.type === 'expiring_very_soon') {
      subject = `⚠️ Your ad expires in ${adData.daysUntilExpiry} days`;
      heading = `Your ad expires in ${adData.daysUntilExpiry} days`;
      actionText = 'Renew Now';
      urgencyClass = 'orange';
    } else {
      subject = `📬 Your ad "${adData.adTitle}" is expiring soon`;
      heading = 'Your Ad is Expiring Soon 📬';
      actionText = 'Renew Your Ad';
      urgencyClass = 'blue';
    }

    const expiryDate = new Date(adData.expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailContent = `
      <h2 style="color: ${urgencyClass === 'red' ? '#dc2626' : urgencyClass === 'orange' ? '#ea580c' : '#3b82f6'}">
        ${heading}
      </h2>
      <p>Hi ${user.name},</p>
      <p>Your ad "<strong>${adData.adTitle}</strong>" will expire on <strong>${expiryDate}</strong>.</p>
      
      <div style="background-color: ${urgencyClass === 'red' ? '#fee2e2' : urgencyClass === 'orange' ? '#fed7aa' : '#dbeafe'}; 
                  border-left: 4px solid ${urgencyClass === 'red' ? '#dc2626' : urgencyClass === 'orange' ? '#ea580c' : '#3b82f6'}; 
                  padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;">
          <strong>Days remaining until expiry: ${adData.daysUntilExpiry}</strong>
        </p>
      </div>

      <p><strong>How to renew:</strong></p>
      <ol>
        <li>Visit your dashboard</li>
        <li>Navigate to "My Ads"</li>
        <li>Click "Renew" on this ad</li>
        <li>Choose your subscription package</li>
        <li>Complete payment</li>
      </ol>

      <a href="${process.env.FRONTEND_URL}/dashboard/ads/${adData.adId}/renew" 
         style="background-color: ${urgencyClass === 'red' ? '#dc2626' : urgencyClass === 'orange' ? '#ea580c' : '#3b82f6'}; 
                 color: white; 
                 padding: 12px 24px; 
                 text-decoration: none; 
                 border-radius: 5px; 
                 display: inline-block;
                 font-weight: bold;">
        ${actionText}
      </a>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        AdFlow Pro - Your Sponsored Listings Platform
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject,
      html: emailContent
    });

    console.log(`✓ Expiry notification (${adData.type}) sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending expiry notification:', error);
    throw error;
  }
};

/**
 * Send renewal success notification
 * Sent when an ad is successfully renewed
 */
export const sendRenewalNotification = async (userId, adData) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.warn(`Could not find user ${userId} for renewal notification`);
      return;
    }

    const newExpiryDate = new Date(adData.newExpiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailContent = `
      <h2>Your Ad Has Been Renewed! ✅</h2>
      <p>Hi ${user.name},</p>
      <p>Congratulations! Your ad "<strong>${adData.adTitle}</strong>" has been successfully renewed.</p>
      
      <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Renewal Details:</strong></p>
        <p>New Expiry Date: <strong>${newExpiryDate}</strong></p>
        <p>Package: <strong>${adData.packageType}</strong></p>
      </div>

      <p>Your ad continues to be visible to all users. You'll receive another notification 7 days before the new expiry date.</p>

      <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        AdFlow Pro - Your Sponsored Listings Platform
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Ad "${adData.adTitle}" Has Been Renewed! ✅`,
      html: emailContent
    });

    console.log(`✓ Renewal notification sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending renewal notification:', error);
    throw error;
  }
};

/**
 * Send batch notification (for admins/moderators)
 * Sent to notify about system events
 */
export const sendBatchNotification = async (userIds, subject, content) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (error || !users) {
      console.warn('Could not fetch users for batch notification');
      return;
    }

    const emailContent = `
      <h2>${subject}</h2>
      ${content}
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        AdFlow Pro - Your Sponsored Listings Platform
      </p>
    `;

    for (const user of users) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html: emailContent
      });
    }

    console.log(`✓ Batch notification sent to ${users.length} users`);
  } catch (error) {
    console.error('Error sending batch notification:', error);
    throw error;
  }
};

export default {
  sendPublishedNotification,
  sendExpiryNotification,
  sendRenewalNotification,
  sendBatchNotification
};
