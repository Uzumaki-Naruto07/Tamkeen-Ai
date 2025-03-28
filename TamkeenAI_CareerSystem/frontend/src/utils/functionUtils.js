// Function manipulation
export const debounce = (func, wait = 0) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export const throttle = (func, wait = 0) => {
  let timeout = null;
  let previous = 0;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
};

export const memoize = (func, resolver) => {
  const cache = new Map();
  const memoized = function (...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    if (!cache.has(key)) {
      cache.set(key, func.apply(this, args));
    }
    return cache.get(key);
  };
  memoized.cache = cache;
  return memoized;
};

export const once = (func) => {
  let result;
  let called = false;
  return function (...args) {
    if (!called) {
      result = func.apply(this, args);
      called = true;
    }
    return result;
  };
};

export const after = (n, func) => {
  return function (...args) {
    if (--n < 1) {
      return func.apply(this, args);
    }
  };
};

export const before = (n, func) => {
  let result;
  return function (...args) {
    if (--n > 0) {
      result = func.apply(this, args);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
};

export const ary = (func, n = func.length) => {
  return function (...args) {
    return func.apply(this, args.slice(0, n));
  };
};

export const unary = (func) => {
  return ary(func, 1);
};

export const negate = (predicate) => {
  return function (...args) {
    return !predicate.apply(this, args);
  };
};

export const flip = (func) => {
  return function (...args) {
    return func.apply(this, args.reverse());
  };
};

export const overArgs = (func, transforms) => {
  const length = transforms.length;
  return function (...args) {
    let index = -1;
    while (++index < length) {
      args[index] = transforms[index].call(this, args[index]);
    }
    return func.apply(this, args);
  };
};

export const rest = (func, start = func.length - 1) => {
  return function (...args) {
    const length = Math.max(start, 0);
    const rest = start;
    const args = args.slice(0, length);
    if (rest) {
      args.push(...args.slice(length));
    }
    return func.apply(this, args);
  };
};

export const spread = (func, start = 0) => {
  return function (args) {
    return func.apply(this, args.slice(start));
  };
};

// Function composition
export const compose = (...funcs) => {
  return function (...args) {
    return funcs.reduceRight((composed, f) => f(composed), args[0]);
  };
};

export const pipe = (...funcs) => {
  return function (...args) {
    return funcs.reduce((composed, f) => f(composed), args[0]);
  };
};

// Function validation
export const isFunction = (value) => {
  return typeof value === 'function';
};

export const isAsyncFunction = (value) => {
  return value && value.constructor.name === 'AsyncFunction';
};

export const isGeneratorFunction = (value) => {
  return value && value.constructor.name === 'GeneratorFunction';
};

// Function execution
export const attempt = (func, ...args) => {
  try {
    return func.apply(null, args);
  } catch (error) {
    return error;
  }
};

export const bind = (func, thisArg, ...partials) => {
  return function (...args) {
    return func.apply(thisArg, [...partials, ...args]);
  };
};

export const bindKey = (object, key, ...partials) => {
  return function (...args) {
    return object[key].apply(object, [...partials, ...args]);
  };
};

export const curry = (func, arity = func.length) => {
  return function curried(...args) {
    if (args.length >= arity) {
      return func.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
};

export const curryRight = (func, arity = func.length) => {
  return function curried(...args) {
    if (args.length >= arity) {
      return func.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, moreArgs.concat(args));
    };
  };
};

export const delay = (func, wait, ...args) => {
  return setTimeout(() => func.apply(null, args), wait);
};

export const defer = (func, ...args) => {
  return setTimeout(() => func.apply(null, args), 1);
};

// Function timing
export const time = (func, ...args) => {
  const start = performance.now();
  const result = func.apply(null, args);
  const end = performance.now();
  return {
    result,
    time: end - start,
  };
};

export const timeAsync = async (func, ...args) => {
  const start = performance.now();
  const result = await func.apply(null, args);
  const end = performance.now();
  return {
    result,
    time: end - start,
  };
};

// Function retry
export const retry = (func, options = {}) => {
  const {
    attempts = 3,
    delay = 1000,
    backoff = 1,
    onError,
  } = options;

  return async function (...args) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
      try {
        return await func.apply(this, args);
      } catch (error) {
        lastError = error;
        if (onError) {
          onError(error, i + 1, attempts);
        }
        if (i < attempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(backoff, i))
          );
        }
      }
    }
    throw lastError;
  };
};

// Function cache
export const cache = (func, options = {}) => {
  const {
    maxSize = 100,
    ttl = 0,
    key = (...args) => JSON.stringify(args),
  } = options;

  const cache = new Map();
  const timestamps = new Map();

  return function (...args) {
    const cacheKey = key.apply(this, args);
    const now = Date.now();
    const timestamp = timestamps.get(cacheKey);

    if (cache.has(cacheKey)) {
      if (ttl && timestamp && now - timestamp > ttl) {
        cache.delete(cacheKey);
        timestamps.delete(cacheKey);
      } else {
        return cache.get(cacheKey);
      }
    }

    const result = func.apply(this, args);
    cache.set(cacheKey, result);
    timestamps.set(cacheKey, now);

    if (cache.size > maxSize) {
      const oldestKey = Array.from(timestamps.entries()).sort(
        ([, a], [, b]) => a - b
      )[0][0];
      cache.delete(oldestKey);
      timestamps.delete(oldestKey);
    }

    return result;
  };
};

// Export function utilities
export default {
  debounce,
  throttle,
  memoize,
  once,
  after,
  before,
  ary,
  unary,
  negate,
  flip,
  overArgs,
  rest,
  spread,
  compose,
  pipe,
  isFunction,
  isAsyncFunction,
  isGeneratorFunction,
  attempt,
  bind,
  bindKey,
  curry,
  curryRight,
  delay,
  defer,
  time,
  timeAsync,
  retry,
  cache,
}; 