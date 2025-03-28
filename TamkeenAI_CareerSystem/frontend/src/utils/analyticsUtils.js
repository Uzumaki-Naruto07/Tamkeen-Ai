import { logError } from './errorUtils';

// Analytics configuration
const ANALYTICS_CONFIG = {
  enabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  debug: process.env.REACT_APP_ANALYTICS_DEBUG === 'true',
  userId: null,
  sessionId: null,
};

// Analytics events
const EVENTS = {
  // User events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_PROFILE_UPDATE: 'user_profile_update',
  USER_PREFERENCES_UPDATE: 'user_preferences_update',

  // Dashboard events
  DASHBOARD_VIEW: 'dashboard_view',
  DASHBOARD_WIDGET_VIEW: 'dashboard_widget_view',
  DASHBOARD_WIDGET_INTERACTION: 'dashboard_widget_interaction',

  // Job events
  JOB_SEARCH: 'job_search',
  JOB_VIEW: 'job_view',
  JOB_APPLY: 'job_apply',
  JOB_SAVE: 'job_save',
  JOB_SHARE: 'job_share',

  // AI Coach events
  AI_COACH_VIEW: 'ai_coach_view',
  AI_COACH_QUESTION: 'ai_coach_question',
  AI_COACH_FEEDBACK: 'ai_coach_feedback',
  AI_COACH_RECOMMENDATION: 'ai_coach_recommendation',

  // Resume events
  RESUME_VIEW: 'resume_view',
  RESUME_EDIT: 'resume_edit',
  RESUME_DOWNLOAD: 'resume_download',
  RESUME_SHARE: 'resume_share',
  RESUME_ATS_SCORE: 'resume_ats_score',

  // Skill events
  SKILL_VIEW: 'skill_view',
  SKILL_ASSESSMENT_START: 'skill_assessment_start',
  SKILL_ASSESSMENT_COMPLETE: 'skill_assessment_complete',
  SKILL_COURSE_START: 'skill_course_start',
  SKILL_COURSE_COMPLETE: 'skill_course_complete',

  // Achievement events
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  ACHIEVEMENT_VIEW: 'achievement_view',
  ACHIEVEMENT_SHARE: 'achievement_share',

  // Interview events
  INTERVIEW_START: 'interview_start',
  INTERVIEW_COMPLETE: 'interview_complete',
  INTERVIEW_FEEDBACK: 'interview_feedback',
  INTERVIEW_RECORDING: 'interview_recording',

  // Error events
  ERROR: 'error',
  ERROR_BOUNDARY: 'error_boundary',
};

// Analytics class
class Analytics {
  constructor() {
    this.config = ANALYTICS_CONFIG;
    this.events = EVENTS;
    this.initialized = false;
  }

  // Initialize analytics
  init(userId = null) {
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('Analytics disabled');
      }
      return;
    }

    try {
      this.config.userId = userId;
      this.config.sessionId = this.generateSessionId();
      this.initialized = true;

      if (this.config.debug) {
        console.log('Analytics initialized', {
          userId: this.config.userId,
          sessionId: this.config.sessionId,
        });
      }
    } catch (error) {
      logError(error, { context: 'Analytics initialization' });
    }
  }

  // Generate session ID
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track event
  track(eventName, properties = {}) {
    if (!this.initialized || !this.config.enabled) {
      return;
    }

    try {
      const event = {
        eventName,
        timestamp: new Date().toISOString(),
        userId: this.config.userId,
        sessionId: this.config.sessionId,
        properties: {
          ...properties,
          url: window.location.href,
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      // Send event to analytics service
      this.sendEvent(event);

      if (this.config.debug) {
        console.log('Event tracked:', event);
      }
    } catch (error) {
      logError(error, {
        context: 'Event tracking',
        eventName,
        properties,
      });
    }
  }

  // Send event to analytics service
  async sendEvent(event) {
    try {
      // Here you would integrate with your analytics service (e.g., Google Analytics, Mixpanel)
      // Example:
      // await analyticsService.track(event);
    } catch (error) {
      logError(error, {
        context: 'Event sending',
        event,
      });
    }
  }

  // Track page view
  trackPageView(properties = {}) {
    this.track('page_view', {
      ...properties,
      path: window.location.pathname,
      title: document.title,
    });
  }

  // Track user action
  trackUserAction(action, properties = {}) {
    this.track('user_action', {
      ...properties,
      action,
    });
  }

  // Track error
  trackError(error, properties = {}) {
    this.track(this.events.ERROR, {
      ...properties,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
  }

  // Track error boundary
  trackErrorBoundary(error, errorInfo, properties = {}) {
    this.track(this.events.ERROR_BOUNDARY, {
      ...properties,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo,
    });
  }

  // Track performance
  trackPerformance(metric, value, properties = {}) {
    this.track('performance', {
      ...properties,
      metric,
      value,
    });
  }

  // Track user engagement
  trackEngagement(action, duration, properties = {}) {
    this.track('user_engagement', {
      ...properties,
      action,
      duration,
    });
  }

  // Track feature usage
  trackFeatureUsage(feature, properties = {}) {
    this.track('feature_usage', {
      ...properties,
      feature,
    });
  }

  // Track conversion
  trackConversion(action, value, properties = {}) {
    this.track('conversion', {
      ...properties,
      action,
      value,
    });
  }

  // Track search
  trackSearch(query, results, properties = {}) {
    this.track('search', {
      ...properties,
      query,
      resultsCount: results?.length || 0,
    });
  }

  // Track recommendation
  trackRecommendation(type, item, properties = {}) {
    this.track('recommendation', {
      ...properties,
      type,
      item,
    });
  }

  // Track feedback
  trackFeedback(type, rating, comment, properties = {}) {
    this.track('feedback', {
      ...properties,
      type,
      rating,
      comment,
    });
  }

  // Track notification
  trackNotification(type, action, properties = {}) {
    this.track('notification', {
      ...properties,
      type,
      action,
    });
  }

  // Track social interaction
  trackSocialInteraction(platform, action, properties = {}) {
    this.track('social_interaction', {
      ...properties,
      platform,
      action,
    });
  }

  // Track accessibility
  trackAccessibility(action, properties = {}) {
    this.track('accessibility', {
      ...properties,
      action,
    });
  }

  // Track security
  trackSecurity(event, properties = {}) {
    this.track('security', {
      ...properties,
      event,
    });
  }

  // Track compliance
  trackCompliance(action, properties = {}) {
    this.track('compliance', {
      ...properties,
      action,
    });
  }

  // Track system health
  trackSystemHealth(metric, value, properties = {}) {
    this.track('system_health', {
      ...properties,
      metric,
      value,
    });
  }

  // Track user journey
  trackUserJourney(step, properties = {}) {
    this.track('user_journey', {
      ...properties,
      step,
    });
  }

  // Track A/B test
  trackABTest(variant, properties = {}) {
    this.track('ab_test', {
      ...properties,
      variant,
    });
  }

  // Track custom event
  trackCustom(eventName, properties = {}) {
    this.track(eventName, properties);
  }

  // Reset analytics
  reset() {
    this.config.userId = null;
    this.config.sessionId = null;
    this.initialized = false;

    if (this.config.debug) {
      console.log('Analytics reset');
    }
  }
}

// Create analytics instance
const analytics = new Analytics();

// Export analytics utilities
export default {
  analytics,
  EVENTS,
}; 