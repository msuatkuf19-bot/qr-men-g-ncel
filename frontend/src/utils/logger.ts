/**
 * Production-safe logger
 * Development modda console.log çalışır, production'da sessizce geçer
 */

const IS_DEV = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

function createLogger(): Logger {
  const noop = () => {};

  if (IS_DEV && typeof console !== 'undefined') {
    return {
      log: (...args) => console.log('[DEV]', ...args),
      warn: (...args) => console.warn('[DEV]', ...args),
      error: (...args) => console.error(...args), // Error her zaman loglanır
      info: (...args) => console.info('[DEV]', ...args),
      debug: (...args) => console.debug('[DEV]', ...args),
    };
  }

  // Production'da sadece error loglanır
  return {
    log: noop,
    warn: noop,
    error: typeof console !== 'undefined' ? (...args) => console.error(...args) : noop,
    info: noop,
    debug: noop,
  };
}

export const logger = createLogger();

// Conditional logging - belirli durumda log
export function logIf(condition: boolean, level: LogLevel, ...args: any[]) {
  if (condition) {
    logger[level](...args);
  }
}

// Performance timing logger
export function logTiming(label: string, fn: () => void) {
  if (!IS_DEV) {
    fn();
    return;
  }

  const start = performance.now();
  fn();
  const end = performance.now();
  logger.debug(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
}

// Async performance timing
export async function logTimingAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!IS_DEV) {
    return fn();
  }

  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  logger.debug(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}
