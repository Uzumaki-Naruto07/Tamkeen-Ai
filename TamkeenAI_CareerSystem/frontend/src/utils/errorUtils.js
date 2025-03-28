// Custom error classes
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', status = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details = {}) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Authorization failed', details = {}) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = {}) {
    super(message, 'NOT_FOUND_ERROR', 404, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = {}) {
    super(message, 'CONFLICT_ERROR', 409, details);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error', details = {}) {
    super(message, 'NETWORK_ERROR', 503, details);
    this.name = 'NetworkError';
  }
}

// Error handling
export const handleError = (error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500,
    details: {
      originalError: error,
    },
  };
};

export const isError = (error) => {
  return error instanceof Error;
};

export const isAppError = (error) => {
  return error instanceof AppError;
};

export const isValidationError = (error) => {
  return error instanceof ValidationError;
};

export const isAuthenticationError = (error) => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error) => {
  return error instanceof AuthorizationError;
};

export const isNotFoundError = (error) => {
  return error instanceof NotFoundError;
};

export const isConflictError = (error) => {
  return error instanceof ConflictError;
};

export const isNetworkError = (error) => {
  return error instanceof NetworkError;
};

// Error creation
export const createError = (message, code = 'APP_ERROR', status = 500, details = {}) => {
  return new AppError(message, code, status, details);
};

export const createValidationError = (message, details = {}) => {
  return new ValidationError(message, details);
};

export const createAuthenticationError = (message = 'Authentication failed', details = {}) => {
  return new AuthenticationError(message, details);
};

export const createAuthorizationError = (message = 'Authorization failed', details = {}) => {
  return new AuthorizationError(message, details);
};

export const createNotFoundError = (message = 'Resource not found', details = {}) => {
  return new NotFoundError(message, details);
};

export const createConflictError = (message = 'Resource conflict', details = {}) => {
  return new ConflictError(message, details);
};

export const createNetworkError = (message = 'Network error', details = {}) => {
  return new NetworkError(message, details);
};

// Error wrapping
export const wrapError = (error, message, code, status, details = {}) => {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError(message, code, status, {
    ...details,
    originalError: error,
  });
};

export const wrapValidationError = (error, message, details = {}) => {
  if (error instanceof ValidationError) {
    return error;
  }
  return new ValidationError(message, {
    ...details,
    originalError: error,
  });
};

export const wrapAuthenticationError = (error, message = 'Authentication failed', details = {}) => {
  if (error instanceof AuthenticationError) {
    return error;
  }
  return new AuthenticationError(message, {
    ...details,
    originalError: error,
  });
};

export const wrapAuthorizationError = (error, message = 'Authorization failed', details = {}) => {
  if (error instanceof AuthorizationError) {
    return error;
  }
  return new AuthorizationError(message, {
    ...details,
    originalError: error,
  });
};

export const wrapNotFoundError = (error, message = 'Resource not found', details = {}) => {
  if (error instanceof NotFoundError) {
    return error;
  }
  return new NotFoundError(message, {
    ...details,
    originalError: error,
  });
};

export const wrapConflictError = (error, message = 'Resource conflict', details = {}) => {
  if (error instanceof ConflictError) {
    return error;
  }
  return new ConflictError(message, {
    ...details,
    originalError: error,
  });
};

export const wrapNetworkError = (error, message = 'Network error', details = {}) => {
  if (error instanceof NetworkError) {
    return error;
  }
  return new NetworkError(message, {
    ...details,
    originalError: error,
  });
};

// Error logging
export const logError = (error, options = {}) => {
  const {
    level = 'error',
    context = {},
    logger = console,
  } = options;

  const errorInfo = handleError(error);
  const logData = {
    ...errorInfo,
    ...context,
    timestamp: new Date().toISOString(),
  };

  switch (level) {
    case 'debug':
      logger.debug(logData);
      break;
    case 'info':
      logger.info(logData);
      break;
    case 'warn':
      logger.warn(logData);
      break;
    case 'error':
    default:
      logger.error(logData);
  }
};

// Error tracking
export const trackError = (error, options = {}) => {
  const {
    service = 'app',
    environment = process.env.NODE_ENV || 'development',
    context = {},
  } = options;

  // Here you would integrate with your error tracking service (e.g., Sentry)
  const errorInfo = handleError(error);
  const trackingData = {
    ...errorInfo,
    service,
    environment,
    ...context,
    timestamp: new Date().toISOString(),
  };

  // Example: Send to error tracking service
  // errorTrackingService.captureError(trackingData);
};

// Error recovery
export const recoverFromError = async (error, options = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 1,
    onError,
  } = options;

  let lastError = error;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await options.operation();
    } catch (error) {
      lastError = error;
      if (onError) {
        onError(error, attempt, maxAttempts);
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(backoff, attempt - 1))
        );
      }
    }
  }
  throw lastError;
};

// Error boundary
export const withErrorBoundary = (Component, options = {}) => {
  const {
    fallback = () => null,
    onError,
  } = options;

  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      if (onError) {
        onError(error, errorInfo);
      }
    }

    render() {
      if (this.state.hasError) {
        return fallback(this.state.error);
      }
      return this.props.children;
    }
  };
};

// Export error utilities
export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  NetworkError,
  handleError,
  isError,
  isAppError,
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isConflictError,
  isNetworkError,
  createError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createConflictError,
  createNetworkError,
  wrapError,
  wrapValidationError,
  wrapAuthenticationError,
  wrapAuthorizationError,
  wrapNotFoundError,
  wrapConflictError,
  wrapNetworkError,
  logError,
  trackError,
  recoverFromError,
  withErrorBoundary,
}; 