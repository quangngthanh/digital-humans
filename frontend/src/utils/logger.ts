/**
 * Enhanced Logging Utility với timestamp và context
 * Giúp debug animation flow và timing chính xác
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

interface LogStyle {
  color: string;
  icon: string;
  background?: string;
}

const LOG_STYLES: Record<LogLevel, LogStyle> = {
  info: { color: '#3b82f6', icon: 'ℹ️' },
  warn: { color: '#f59e0b', icon: '⚠️' },
  error: { color: '#ef4444', icon: '❌' },
  debug: { color: '#8b5cf6', icon: '🔍' },
  success: { color: '#10b981', icon: '✅' }
};

class Logger {
  private startTime: number = Date.now();
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private formatTime(): string {
    const now = Date.now();
    const elapsed = now - this.startTime;
    const timestamp = new Date().toLocaleTimeString('vi-VN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit', 
      second: '2-digit'
    });
    
    return `[${timestamp}] (+${elapsed}ms)`;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const style = LOG_STYLES[level];
    const timeStr = this.formatTime();
    const contextStr = `[${this.context}]`;
    
    const styledMessage = `%c${style.icon} ${timeStr} ${contextStr} ${message}`;
    const cssStyle = `color: ${style.color}; font-weight: bold;`;
    
    switch (level) {
      case 'error':
        console.error(styledMessage, cssStyle, ...args);
        break;
      case 'warn':
        console.warn(styledMessage, cssStyle, ...args);
        break;
      default:
        console.log(styledMessage, cssStyle, ...args);
        break;
    }
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  success(message: string, ...args: any[]): void {
    this.log('success', message, ...args);
  }

  // Animation specific methods
  animationStart(name: string): void {
    this.log('info', `🎬 Animation Started: "${name}"`);
  }

  animationEnd(name: string): void {
    this.log('success', `🏁 Animation Finished: "${name}"`);
  }

  animationError(name: string, error: any): void {
    this.log('error', `💥 Animation Failed: "${name}"`, error);
  }

  idleStart(name: string): void {
    this.log('info', `😴 Idle Animation: "${name}"`);
  }

  delayStart(duration: number): void {
    this.log('debug', `⏳ Delay Started: ${duration}ms`);
  }

  delayEnd(): void {
    this.log('success', `⏰ Delay Finished`);
  }

  stateChange(from: string, to: string): void {
    this.log('info', `🔄 State Change: ${from} → ${to}`);
  }

  // Timing measurement
  startTimer(label: string): void {
    console.time(`⏱️ ${this.context} - ${label}`);
  }

  endTimer(label: string): void {
    console.timeEnd(`⏱️ ${this.context} - ${label}`);
  }

  // Group logging for complex flows
  group(title: string): void {
    console.group(`📋 ${this.formatTime()} [${this.context}] ${title}`);
  }

  groupEnd(): void {
    console.groupEnd();
  }

  // Reset start time (useful for new sessions)
  resetTimer(): void {
    this.startTime = Date.now();
    this.log('info', '🔄 Timer Reset');
  }
}

// Pre-configured loggers for different modules
export const animationLogger = new Logger('Animation');
export const avatarLogger = new Logger('Avatar');
export const audioLogger = new Logger('Audio');
export const chatLogger = new Logger('Chat');

// Default logger
export const logger = new Logger();

// Export Logger class for custom contexts
export { Logger };

// Quick logging functions (không cần tạo instance)
export const logTime = (message: string, ...args: any[]): void => {
  logger.info(message, ...args);
};

export const logError = (message: string, ...args: any[]): void => {
  logger.error(message, ...args);
};

export const logDebug = (message: string, ...args: any[]): void => {
  logger.debug(message, ...args);
};

/**
 * Console Suppression Utilities
 * Để ẩn các warning/error không cần thiết từ Three.js
 */

// Store original console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Patterns to suppress
const SUPPRESS_PATTERNS = [
  /THREE\.PropertyBinding: Trying to update node for track: .* but it wasn't found/,
  /THREE\.PropertyBinding: Can't find property/,
  /THREE\.PropertyBinding: Trying to update .* but it wasn't found/,
  /THREE\.AnimationMixer: .* clip found/,
  /THREE\.KeyframeTrack: .* is not a valid property/,
];

/**
 * Check if message should be suppressed
 */
function shouldSuppress(message: string): boolean {
  return SUPPRESS_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Suppress console warnings/errors for Three.js animation issues
 */
export function suppressThreeJSWarnings(): void {
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalConsoleWarn.apply(console, args);
    }
  };

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalConsoleError.apply(console, args);
    }
  };

}

/**
 * Restore original console methods
 */
export function restoreConsole(): void {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  logger.info('🔊 Console restored');
}

/**
 * Suppress specific Three.js PropertyBinding errors
 */
export function suppressPropertyBindingErrors(): void {
  const originalWarn = console.warn;
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress PropertyBinding errors
    if (message.includes('THREE.PropertyBinding') && 
        message.includes('wasn\'t found')) {
      return; // Suppress this warning
    }
    
    // Allow other warnings
    originalWarn.apply(console, args);
  };
  
  logger.info('🔇 PropertyBinding errors suppressed');
}
