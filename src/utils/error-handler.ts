import * as vscode from 'vscode';
import { Logger } from './logger';

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  CONFIGURATION = 'Configuration',
  RUNTIME = 'Runtime',
  RESOURCE = 'Resource',
  VALIDATION = 'Validation'
}

/**
 * Custom error class with category and actionable message
 */
export class ExtensionError extends Error {
  constructor(
    public category: ErrorCategory,
    message: string,
    public actionableMessage?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ExtensionError';
  }
}

/**
 * Error handler utility for graceful error handling
 */
export class ErrorHandler {
  constructor(private logger: Logger) {}

  /**
   * Handle a configuration error
   */
  handleConfigurationError(
    error: any,
    filePath: string,
    showNotification: boolean = true
  ): void {
    const message = `Configuration error in ${filePath}`;
    this.logger.error(message, error);

    if (showNotification) {
      const actionableMessage = this.getActionableMessage(error, ErrorCategory.CONFIGURATION);
      vscode.window.showErrorMessage(
        `${message}: ${actionableMessage}`,
        'View File',
        'Show Logs'
      ).then(action => {
        if (action === 'View File') {
          vscode.workspace.openTextDocument(filePath).then(doc => {
            vscode.window.showTextDocument(doc);
          });
        } else if (action === 'Show Logs') {
          this.logger.show();
        }
      });
    }
  }

  /**
   * Handle a runtime error
   */
  handleRuntimeError(
    error: any,
    component: string,
    showNotification: boolean = true
  ): void {
    const message = `Runtime error in ${component}`;
    this.logger.error(message, error);

    if (showNotification) {
      const actionableMessage = this.getActionableMessage(error, ErrorCategory.RUNTIME);
      vscode.window.showErrorMessage(
        `${message}: ${actionableMessage}`,
        'Show Logs',
        'Retry'
      ).then(action => {
        if (action === 'Show Logs') {
          this.logger.show();
        }
      });
    }
  }

  /**
   * Handle a resource error (file operations)
   */
  handleResourceError(
    error: any,
    resourcePath: string,
    showNotification: boolean = true
  ): void {
    const message = `Resource error for ${resourcePath}`;
    this.logger.error(message, error);

    if (showNotification) {
      const actionableMessage = this.getActionableMessage(error, ErrorCategory.RESOURCE);
      vscode.window.showErrorMessage(
        `${message}: ${actionableMessage}`,
        'Show Logs'
      ).then(action => {
        if (action === 'Show Logs') {
          this.logger.show();
        }
      });
    }
  }

  /**
   * Handle a validation error
   */
  handleValidationError(
    error: any,
    context: string,
    showNotification: boolean = true
  ): void {
    const message = `Validation error in ${context}`;
    this.logger.error(message, error);

    if (showNotification) {
      const actionableMessage = this.getActionableMessage(error, ErrorCategory.VALIDATION);
      vscode.window.showWarningMessage(
        `${message}: ${actionableMessage}`,
        'Show Logs'
      ).then(action => {
        if (action === 'Show Logs') {
          this.logger.show();
        }
      });
    }
  }

  /**
   * Get an actionable error message based on error type
   */
  private getActionableMessage(error: any, category: ErrorCategory): string {
    // Handle ExtensionError with actionable message
    if (error instanceof ExtensionError && error.actionableMessage) {
      return error.actionableMessage;
    }

    // Handle common Node.js error codes
    if (error.code) {
      switch (error.code) {
        case 'ENOENT':
          return 'File or directory not found. Please check the path.';
        case 'EACCES':
          return 'Permission denied. Please check file permissions.';
        case 'ENOSPC':
          return 'No space left on device. Please free up disk space.';
        case 'EEXIST':
          return 'File already exists. Please choose a different name.';
        case 'EISDIR':
          return 'Expected a file but found a directory.';
        case 'ENOTDIR':
          return 'Expected a directory but found a file.';
        default:
          break;
      }
    }

    // Category-specific messages
    switch (category) {
      case ErrorCategory.CONFIGURATION:
        return 'Please check your configuration file for syntax errors or missing required fields.';
      case ErrorCategory.RUNTIME:
        return 'An unexpected error occurred. Please try again or check the logs for details.';
      case ErrorCategory.RESOURCE:
        return 'Failed to access the resource. Please check if the file exists and you have permission.';
      case ErrorCategory.VALIDATION:
        return 'Validation failed. Please check the input and try again.';
      default:
        return error.message || 'An unknown error occurred.';
    }
  }

  /**
   * Execute a function with error boundary
   */
  async withErrorBoundary<T>(
    fn: () => Promise<T>,
    context: string,
    category: ErrorCategory = ErrorCategory.RUNTIME,
    showNotification: boolean = true
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error: any) {
      switch (category) {
        case ErrorCategory.CONFIGURATION:
          this.handleConfigurationError(error, context, showNotification);
          break;
        case ErrorCategory.RUNTIME:
          this.handleRuntimeError(error, context, showNotification);
          break;
        case ErrorCategory.RESOURCE:
          this.handleResourceError(error, context, showNotification);
          break;
        case ErrorCategory.VALIDATION:
          this.handleValidationError(error, context, showNotification);
          break;
      }
      return null;
    }
  }

  /**
   * Execute a function with error boundary (synchronous version)
   */
  withErrorBoundarySync<T>(
    fn: () => T,
    context: string,
    category: ErrorCategory = ErrorCategory.RUNTIME,
    showNotification: boolean = true
  ): T | null {
    try {
      return fn();
    } catch (error: any) {
      switch (category) {
        case ErrorCategory.CONFIGURATION:
          this.handleConfigurationError(error, context, showNotification);
          break;
        case ErrorCategory.RUNTIME:
          this.handleRuntimeError(error, context, showNotification);
          break;
        case ErrorCategory.RESOURCE:
          this.handleResourceError(error, context, showNotification);
          break;
        case ErrorCategory.VALIDATION:
          this.handleValidationError(error, context, showNotification);
          break;
      }
      return null;
    }
  }
}

/**
 * Create an error handler with a logger
 */
export function createErrorHandler(logger: Logger): ErrorHandler {
  return new ErrorHandler(logger);
}
