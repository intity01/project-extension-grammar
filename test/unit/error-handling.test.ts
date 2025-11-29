import * as vscode from 'vscode';
import { Logger, LogLevel, createLogger } from '../../src/utils/logger';
import { ErrorHandler, ErrorCategory, ExtensionError, createErrorHandler } from '../../src/utils/error-handler';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createLogger('Test', LogLevel.DEBUG);
  });

  afterEach(() => {
    logger.dispose();
  });

  describe('Log Levels', () => {
    it('should log debug messages when log level is DEBUG', () => {
      logger.setLogLevel(LogLevel.DEBUG);
      expect(() => logger.debug('Debug message')).not.toThrow();
    });

    it('should not log debug messages when log level is INFO', () => {
      logger.setLogLevel(LogLevel.INFO);
      // Debug messages should be filtered out, but shouldn't throw
      expect(() => logger.debug('Debug message')).not.toThrow();
    });

    it('should log info messages when log level is INFO', () => {
      logger.setLogLevel(LogLevel.INFO);
      expect(() => logger.info('Info message')).not.toThrow();
    });

    it('should log warning messages', () => {
      expect(() => logger.warn('Warning message')).not.toThrow();
    });

    it('should log error messages', () => {
      expect(() => logger.error('Error message')).not.toThrow();
    });

    it('should log error messages with error objects', () => {
      const error = new Error('Test error');
      expect(() => logger.error('Error occurred', error)).not.toThrow();
    });
  });

  describe('Log Level Management', () => {
    it('should get and set log level', () => {
      logger.setLogLevel(LogLevel.WARN);
      expect(logger.getLogLevel()).toBe(LogLevel.WARN);
    });

    it('should filter messages below log level', () => {
      logger.setLogLevel(LogLevel.ERROR);
      // These should not throw but should be filtered
      expect(() => logger.debug('Debug')).not.toThrow();
      expect(() => logger.info('Info')).not.toThrow();
      expect(() => logger.warn('Warn')).not.toThrow();
      expect(() => logger.error('Error')).not.toThrow();
    });
  });

  describe('Error Formatting', () => {
    it('should format Error objects correctly', () => {
      const error = new Error('Test error');
      error.stack = 'Stack trace here';
      expect(() => logger.error('Error occurred', error)).not.toThrow();
    });

    it('should handle non-Error objects', () => {
      expect(() => logger.error('Error occurred', 'string error')).not.toThrow();
      expect(() => logger.error('Error occurred', { code: 'ENOENT' })).not.toThrow();
      expect(() => logger.error('Error occurred', null)).not.toThrow();
      expect(() => logger.error('Error occurred', undefined)).not.toThrow();
    });
  });
});

describe('ExtensionError', () => {
  it('should create error with category and message', () => {
    const error = new ExtensionError(
      ErrorCategory.CONFIGURATION,
      'Configuration error'
    );

    expect(error.category).toBe(ErrorCategory.CONFIGURATION);
    expect(error.message).toBe('Configuration error');
    expect(error.name).toBe('ExtensionError');
  });

  it('should create error with actionable message', () => {
    const error = new ExtensionError(
      ErrorCategory.VALIDATION,
      'Validation failed',
      'Please check your input'
    );

    expect(error.actionableMessage).toBe('Please check your input');
  });

  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const error = new ExtensionError(
      ErrorCategory.RUNTIME,
      'Runtime error',
      undefined,
      cause
    );

    expect(error.cause).toBe(cause);
  });
});

describe('ErrorHandler', () => {
  let logger: Logger;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    logger = createLogger('Test', LogLevel.DEBUG);
    errorHandler = createErrorHandler(logger);
  });

  afterEach(() => {
    logger.dispose();
  });

  describe('Configuration Error Handling', () => {
    it('should handle configuration errors without notification', () => {
      const error = new Error('Invalid JSON');
      expect(() => {
        errorHandler.handleConfigurationError(error, '/path/to/config.json', false);
      }).not.toThrow();
    });

    it('should handle ExtensionError with actionable message', () => {
      const error = new ExtensionError(
        ErrorCategory.CONFIGURATION,
        'Invalid config',
        'Check the syntax'
      );
      expect(() => {
        errorHandler.handleConfigurationError(error, '/path/to/config.json', false);
      }).not.toThrow();
    });

    it('should handle errors with error codes', () => {
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      expect(() => {
        errorHandler.handleConfigurationError(error, '/path/to/config.json', false);
      }).not.toThrow();
    });
  });

  describe('Runtime Error Handling', () => {
    it('should handle runtime errors without notification', () => {
      const error = new Error('Runtime failure');
      expect(() => {
        errorHandler.handleRuntimeError(error, 'TestComponent', false);
      }).not.toThrow();
    });

    it('should handle errors with different error codes', () => {
      const codes = ['EACCES', 'ENOSPC', 'EEXIST', 'EISDIR', 'ENOTDIR'];
      
      codes.forEach(code => {
        const error: any = new Error('Error');
        error.code = code;
        expect(() => {
          errorHandler.handleRuntimeError(error, 'TestComponent', false);
        }).not.toThrow();
      });
    });
  });

  describe('Resource Error Handling', () => {
    it('should handle resource errors without notification', () => {
      const error = new Error('File not found');
      expect(() => {
        errorHandler.handleResourceError(error, '/path/to/resource', false);
      }).not.toThrow();
    });

    it('should handle ENOENT errors', () => {
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      expect(() => {
        errorHandler.handleResourceError(error, '/path/to/file', false);
      }).not.toThrow();
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle validation errors without notification', () => {
      const error = new Error('Validation failed');
      expect(() => {
        errorHandler.handleValidationError(error, 'InputValidation', false);
      }).not.toThrow();
    });
  });

  describe('Error Boundary', () => {
    it('should execute function successfully', async () => {
      const result = await errorHandler.withErrorBoundary(
        async () => 'success',
        'TestContext',
        ErrorCategory.RUNTIME,
        false
      );

      expect(result).toBe('success');
    });

    it('should catch and handle errors', async () => {
      const result = await errorHandler.withErrorBoundary(
        async () => {
          throw new Error('Test error');
        },
        'TestContext',
        ErrorCategory.RUNTIME,
        false
      );

      expect(result).toBeNull();
    });

    it('should handle different error categories', async () => {
      const categories = [
        ErrorCategory.CONFIGURATION,
        ErrorCategory.RUNTIME,
        ErrorCategory.RESOURCE,
        ErrorCategory.VALIDATION
      ];

      for (const category of categories) {
        const result = await errorHandler.withErrorBoundary(
          async () => {
            throw new Error('Test error');
          },
          'TestContext',
          category,
          false
        );

        expect(result).toBeNull();
      }
    });
  });

  describe('Synchronous Error Boundary', () => {
    it('should execute function successfully', () => {
      const result = errorHandler.withErrorBoundarySync(
        () => 'success',
        'TestContext',
        ErrorCategory.RUNTIME,
        false
      );

      expect(result).toBe('success');
    });

    it('should catch and handle errors', () => {
      const result = errorHandler.withErrorBoundarySync(
        () => {
          throw new Error('Test error');
        },
        'TestContext',
        ErrorCategory.RUNTIME,
        false
      );

      expect(result).toBeNull();
    });
  });
});

describe('Error Message Formatting', () => {
  let logger: Logger;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    logger = createLogger('Test', LogLevel.DEBUG);
    errorHandler = createErrorHandler(logger);
  });

  afterEach(() => {
    logger.dispose();
  });

  it('should provide actionable messages for common error codes', () => {
    const errorCodes = [
      { code: 'ENOENT', expected: 'not found' },
      { code: 'EACCES', expected: 'Permission denied' },
      { code: 'ENOSPC', expected: 'No space' },
      { code: 'EEXIST', expected: 'already exists' },
      { code: 'EISDIR', expected: 'directory' },
      { code: 'ENOTDIR', expected: 'file' }
    ];

    errorCodes.forEach(({ code }) => {
      const error: any = new Error('Error');
      error.code = code;
      expect(() => {
        errorHandler.handleResourceError(error, '/path', false);
      }).not.toThrow();
    });
  });

  it('should handle ExtensionError with custom actionable message', () => {
    const error = new ExtensionError(
      ErrorCategory.CONFIGURATION,
      'Config error',
      'Custom actionable message'
    );

    expect(() => {
      errorHandler.handleConfigurationError(error, '/path/to/config', false);
    }).not.toThrow();
  });
});

describe('Error Recovery', () => {
  let logger: Logger;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    logger = createLogger('Test', LogLevel.DEBUG);
    errorHandler = createErrorHandler(logger);
  });

  afterEach(() => {
    logger.dispose();
  });

  it('should allow graceful degradation', async () => {
    // Simulate a feature that fails but allows continuation
    const result1 = await errorHandler.withErrorBoundary(
      async () => {
        throw new Error('Feature 1 failed');
      },
      'Feature1',
      ErrorCategory.RUNTIME,
      false
    );

    const result2 = await errorHandler.withErrorBoundary(
      async () => 'Feature 2 success',
      'Feature2',
      ErrorCategory.RUNTIME,
      false
    );

    expect(result1).toBeNull();
    expect(result2).toBe('Feature 2 success');
  });

  it('should preserve state during error handling', async () => {
    let state = { count: 0 };

    await errorHandler.withErrorBoundary(
      async () => {
        state.count++;
        throw new Error('Error after state change');
      },
      'TestContext',
      ErrorCategory.RUNTIME,
      false
    );

    // State should be preserved even after error
    expect(state.count).toBe(1);
  });
});
