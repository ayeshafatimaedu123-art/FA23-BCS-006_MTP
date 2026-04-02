/**
 * Status Workflow Service - Manage ad lifecycle
 * Draft → Submitted → Review → Payment → Published → Expired
 */

const { CONSTANTS } = require('../config/constants');

/**
 * Ad Status Workflow Transitions
 * Defines which statuses can transition to which states
 */
const STATUS_TRANSITIONS = {
  'draft': {
    can_transition_to: ['submitted', 'deleted'],
    description: 'Initial state, ad not yet submitted',
    allowedActions: ['edit', 'submit', 'delete']
  },
  'submitted': {
    can_transition_to: ['under_review', 'draft', 'deleted'],
    description: 'Waiting for moderator review',
    allowedActions: ['edit', 'cancel', 'delete']
  },
  'under_review': {
    can_transition_to: ['approved', 'rejected', 'submitted'],
    description: 'Moderator is reviewing',
    allowedActions: []
  },
  'approved': {
    can_transition_to: ['awaiting_payment', 'rejected'],
    description: 'Approved by moderator, waiting for payment',
    allowedActions: ['pay', 'reject']
  },
  'awaiting_payment': {
    can_transition_to: ['published', 'rejected'],
    description: 'Payment required before publishing',
    allowedActions: ['makePayment', 'cancel']
  },
  'published': {
    can_transition_to: ['paused', 'expired', 'deleted'],
    description: 'Live on marketplace',
    allowedActions: ['edit', 'pause', 'delete']
  },
  'paused': {
    can_transition_to: ['published', 'deleted'],
    description: 'Temporarily hidden from marketplace',
    allowedActions: ['resume', 'delete']
  },
  'expired': {
    can_transition_to: ['published', 'deleted'],
    description: 'Subscription/listing period expired',
    allowedActions: ['renew', 'delete']
  },
  'rejected': {
    can_transition_to: ['draft', 'deleted'],
    description: 'Rejected by moderator',
    allowedActions: ['edit', 'resubmit', 'delete']
  },
  'deleted': {
    can_transition_to: [],
    description: 'Permanently deleted',
    allowedActions: []
  }
};

/**
 * Check if status transition is valid
 * 
 * @param {string} currentStatus - Current ad status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} Is transition valid?
 */
function isValidTransition(currentStatus, newStatus) {
  const transition = STATUS_TRANSITIONS[currentStatus];
  if (!transition) return false;

  return transition.can_transition_to.includes(newStatus);
}

/**
 * Get all valid next statuses for current status
 * 
 * @param {string} currentStatus - Current status
 * @returns {Array} Array of valid next statuses
 */
function getValidNextStatuses(currentStatus) {
  const transition = STATUS_TRANSITIONS[currentStatus];
  if (!transition) return [];

  return transition.can_transition_to;
}

/**
 * Get allowed actions for current status
 * 
 * @param {string} status - Ad status
 * @returns {Array} Array of allowed actions
 */
function getAllowedActions(status) {
  const transition = STATUS_TRANSITIONS[status];
  if (!transition) return [];

  return transition.allowedActions;
}

/**
 * Get status description
 * 
 * @param {string} status - Ad status
 * @returns {string} Description of status
 */
function getStatusDescription(status) {
  const transition = STATUS_TRANSITIONS[status];
  return transition ? transition.description : 'Unknown status';
}

/**
 * Check if ad can be viewed publicly
 * 
 * @param {Object} ad - Ad object
 * @returns {boolean} Can be viewed?
 */
function isAdViewable(ad) {
  // Only published ads can be viewed
  return ad.status === 'published' && !isAdExpired(ad);
}

/**
 * Check if ad is expired
 * 
 * @param {Object} ad - Ad object with expires_at field
 * @returns {boolean} Is expired?
 */
function isAdExpired(ad) {
  if (!ad.expires_at) return false;

  const expiryDate = new Date(ad.expires_at);
  return expiryDate < new Date();
}

/**
 * Calculate days until ad expires
 * 
 * @param {Object} ad - Ad object
 * @returns {number} Days remaining (negative if expired)
 */
function getDaysUntilExpiry(ad) {
  if (!ad.expires_at) return Infinity;

  const expiryDate = new Date(ad.expires_at);
  const daysRemaining = (expiryDate - new Date()) / (1000 * 60 * 60 * 24);

  return Math.ceil(daysRemaining);
}

/**
 * Get expiry status badge
 * 
 * @param {Object} ad - Ad object
 * @returns {Object} {status: string, color: string, message: string}
 */
function getExpiryBadge(ad) {
  const daysRemaining = getDaysUntilExpiry(ad);

  if (daysRemaining < 0) {
    return {
      status: 'expired',
      color: 'red',
      message: 'Expired'
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'expiring-today',
      color: 'orange',
      message: 'Expires today'
    };
  }

  if (daysRemaining <= 3) {
    return {
      status: 'expiring-soon',
      color: 'orange',
      message: `Expires in ${daysRemaining} days`
    };
  }

  if (daysRemaining <= 7) {
    return {
      status: 'expiring-week',
      color: 'yellow',
      message: `Expires in ${daysRemaining} days`
    };
  }

  return {
    status: 'active',
    color: 'green',
    message: `Active (${daysRemaining} days left)`
  };
}

/**
 * Transition ad to new status with validation
 * 
 * @param {Object} ad - Ad object
 * @param {string} newStatus - New status
 * @param {string} reason - Reason for transition (optional)
 * @returns {Object} {success: boolean, error: string|null, ad: updated ad}
 */
function transitionAdStatus(ad, newStatus, reason = '') {
  if (!isValidTransition(ad.status, newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${ad.status} to ${newStatus}`,
      ad: null
    };
  }

  const updatedAd = {
    ...ad,
    status: newStatus,
    updated_at: new Date(),
    status_history: [
      ...(ad.status_history || []),
      {
        from_status: ad.status,
        to_status: newStatus,
        changed_at: new Date(),
        reason,
        changed_by: 'system'
      }
    ]
  };

  return {
    success: true,
    error: null,
    ad: updatedAd
  };
}

/**
 * Get workflow step for visual progress display
 * Returns 0-5 representing progress through workflow
 * 
 * @param {string} status - Ad status
 * @returns {number} Workflow step (0-5)
 * 
 * @example
 * getWorkflowStep('draft') // 0
 * getWorkflowStep('published') // 4
 */
function getWorkflowStep(status) {
  const steps = {
    'draft': 0,
    'submitted': 1,
    'under_review': 1.5,
    'approved': 2,
    'awaiting_payment': 3,
    'published': 4,
    'paused': 4,
    'expired': 5,
    'rejected': -1,
    'deleted': -1
  };

  return steps[status] ?? -1;
}

/**
 * Get workflow progress percentage
 * 
 * @param {string} status - Ad status
 * @returns {number} Percentage (0-100)
 */
function getWorkflowProgress(status) {
  const step = getWorkflowStep(status);
  
  if (step === -1) return 0;
  return Math.round((step / 5) * 100);
}

/**
 * Get requirement checklist before status transition
 * 
 * @param {Object} ad - Ad object
 * @param {string} targetStatus - Target status
 * @returns {Array} Array of requirement objects
 */
function getRequirementsForStatus(ad, targetStatus) {
  const requirements = [];

  if (targetStatus === 'submitted') {
    requirements.push({
      requirement: 'Description minimum 50 characters',
      met: (ad.description || '').length >= 50,
      critical: true
    });

    requirements.push({
      requirement: 'At least one image/video',
      met: (ad.media_count || 0) > 0,
      critical: true
    });

    requirements.push({
      requirement: 'Valid price entered',
      met: ad.price > 0,
      critical: true
    });

    requirements.push({
      requirement: 'Category selected',
      met: !!ad.category_id,
      critical: true
    });

    requirements.push({
      requirement: 'City selected',
      met: !!ad.city_id,
      critical: true
    });
  }

  if (targetStatus === 'awaiting_payment') {
    requirements.push({
      requirement: 'Moderator approval',
      met: ad.status === 'approved',
      critical: true
    });

    requirements.push({
      requirement: 'Package selected',
      met: !!ad.package_type,
      critical: true
    });
  }

  if (targetStatus === 'published') {
    requirements.push({
      requirement: 'Payment verified',
      met: !!ad.payment_verified,
      critical: true
    });

    requirements.push({
      requirement: 'Moderator approved',
      met: ad.status === 'awaiting_payment' || ad.status === 'published',
      critical: true
    });
  }

  return requirements;
}

/**
 * Check if all requirements for status are met
 * 
 * @param {Object} ad - Ad object
 * @param {string} targetStatus - Target status
 * @returns {boolean} All requirements met?
 */
function areRequirementsMet(ad, targetStatus) {
  const requirements = getRequirementsForStatus(ad, targetStatus);
  return requirements.every(req => req.met);
}

/**
 * Get status color for UI display
 * 
 * @param {string} status - Ad status
 * @returns {string} CSS color class (Tailwind)
 */
function getStatusColor(status) {
  const colors = {
    'draft': 'bg-gray-200 text-gray-800',
    'submitted': 'bg-blue-200 text-blue-800',
    'under_review': 'bg-purple-200 text-purple-800',
    'approved': 'bg-green-200 text-green-800',
    'awaiting_payment': 'bg-yellow-200 text-yellow-800',
    'published': 'bg-green-500 text-white',
    'paused': 'bg-orange-200 text-orange-800',
    'expired': 'bg-red-200 text-red-800',
    'rejected': 'bg-red-200 text-red-800',
    'deleted': 'bg-gray-300 text-gray-800'
  };

  return colors[status] || 'bg-gray-100 text-gray-700';
}

/**
 * Get status icon for UI
 * 
 * @param {string} status - Ad status
 * @returns {string} Icon emoji/symbol
 */
function getStatusIcon(status) {
  const icons = {
    'draft': '✏️',
    'submitted': '📤',
    'under_review': '👀',
    'approved': '✅',
    'awaiting_payment': '💳',
    'published': '🚀',
    'paused': '⏸️',
    'expired': '⏰',
    'rejected': '❌',
    'deleted': '🗑️'
  };

  return icons[status] || '?';
}

/**
 * Get reason explanation for status
 * 
 * @param {string} status - Ad status
 * @param {Object} ad - Ad object (optional, for context)
 * @returns {string} Explanation
 */
function getStatusExplanation(status, ad = null) {
  const explanations = {
    'draft': 'Your ad is in draft mode. Complete setup and submit for review.',
    'submitted': 'Your ad has been submitted for review. Wait for moderator approval.',
    'under_review': 'A moderator is reviewing your ad content.',
    'approved': 'Great! Your ad was approved. Now proceed to payment.',
    'awaiting_payment': 'Complete payment to publish your ad to the marketplace.',
    'published': '🎉 Your ad is live! It\'s visible to buyers on the marketplace.',
    'paused': 'Your ad is temporarily hidden. You can resume it anytime.',
    'expired': 'Your listing period has expired. Renew to continue.',
    'rejected': 'Your ad was rejected. Review feedback and resubmit.',
    'deleted': 'This ad has been permanently deleted.'
  };

  return explanations[status] || 'Unknown status';
}

/**
 * Get time estimate for status transition
 * 
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {Object} {min: hours, max: hours, estimate: string}
 */
function getTransitionTimeEstimate(fromStatus, toStatus) {
  const estimates = {
    'submitted->under_review': { min: 0, max: 2, estimate: 'Usually 1-2 hours' },
    'under_review->approved': { min: 1, max: 24, estimate: 'Usually 1-24 hours' },
    'approved->awaiting_payment': { min: 0, max: 0.1, estimate: 'Instant' },
    'awaiting_payment->published': { min: 0, max: 1, estimate: 'Within 1 hour' }
  };

  const key = `${fromStatus}->${toStatus}`;
  return estimates[key] || { min: 0, max: 24, estimate: 'Variable' };
}

module.exports = {
  // Validation & Checks
  isValidTransition,
  isAdViewable,
  isAdExpired,
  areRequirementsMet,

  // Status Info
  getValidNextStatuses,
  getAllowedActions,
  getStatusDescription,
  getRequirementsForStatus,

  // Transitions
  transitionAdStatus,

  // Progress Tracking
  getWorkflowStep,
  getWorkflowProgress,
  getDaysUntilExpiry,

  // UI Helpers
  getStatusColor,
  getStatusIcon,
  getStatusExplanation,
  getExpiryBadge,
  getTransitionTimeEstimate,

  // Constants
  STATUS_TRANSITIONS
};
