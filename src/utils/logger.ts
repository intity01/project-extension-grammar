import * as vscode from 'vscode';

/**
 * Log levels for the extension logger
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger utility for the extension with different log levels
 * Provides structured logging with timestamps and context
 */
export class Logger {
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel;
  private context: string;

  constructor(context: string, logLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.logLevel = logLevel;
    this.outputChannel = vscode.window.createOutputChannel(`Project Extension Grammar - ${context}`);
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Get the current log level
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: any, ...args: any[]): void {
    const errorDetails = error ? this.formatError(error) : '';
    this.log(LogLevel.ERROR, message, errorDetails, ...args);
  }

  /**
   * Show the output channel
   */
  show(): void {
    this.outputChannel.show();
  }

  /**
   * Dispose the logger
   */
  dispose(): void {
    this.outputChannel.dispose();
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => this.formatArg(arg)).join(' ') : '';
    const logMessage = `[${timestamp}] [${levelStr}] [${this.context}] ${message}${formattedArgs}`;

    this.outputChannel.appendLine(logMessage);

    // Also log to console for development
    if (level === LogLevel.ERROR) {
      console.error(logMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * Format an argument for logging
   */
  private formatArg(arg: any): string {
    if (arg === null) {
      return 'null';
    }
    if (arg === undefined) {
      return 'undefined';
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }

  /**
   * Format an error for logging
   */
  private formatError(error: any): string {
    if (error instanceof Error) {
      return `${error.message}\nStack: ${error.stack || 'No stack trace'}`;
    }
    return String(error);
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger | null = null;

/**
 * Initialize the global logger
 */
export function initializeLogger(logLevel: LogLevel = LogLevel.INFO): Logger {
  if (!globalLogger) {
    globalLogger = new Logger('Global', logLevel);
  }
  return globalLogger;
}

/**
 * Get the global logger instance
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = initializeLogger();
  }
  return globalLogger;
}

/**
 * Create a logger for a specific component
 */
export function createLogger(context: string, logLevel?: LogLevel): Logger {
  return new Logger(context, logLevel);
}

/**
 * Dispose all loggers
 */
export function disposeLoggers(): void {
  if (globalLogger) {
    globalLogger.dispose();
    globalLogger = null;
  }
}
