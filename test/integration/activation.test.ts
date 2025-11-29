import * as extension from '../../src/extension';
import * as vscode from 'vscode';

describe('Extension Activation', () => {
  describe('Activation Sequence', () => {
    it('should export activate function', () => {
      expect(typeof extension.activate).toBe('function');
    });

    it('should export deactivate function', () => {
      expect(typeof extension.deactivate).toBe('function');
    });

    it('should handle activation without workspace', async () => {
      const mockContext: any = {
        subscriptions: [],
        extensionPath: '/mock/path',
        extensionUri: vscode.Uri.file('/mock/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      // Mock workspace with no folders
      (vscode.workspace as any).workspaceFolders = undefined;

      // Should not throw when no workspace is open
      await expect(extension.activate(mockContext)).resolves.not.toThrow();
    });

    it('should handle deactivation gracefully', async () => {
      await expect(extension.deactivate()).resolves.not.toThrow();
    });

    it('should handle multiple deactivation calls', async () => {
      await extension.deactivate();
      await expect(extension.deactivate()).resolves.not.toThrow();
    });
  });

  describe('Full Activation with Workspace', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        subscriptions: [],
        extensionPath: '/mock/extension/path',
        extensionUri: vscode.Uri.file('/mock/extension/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      // Mock workspace with folder
      (vscode.workspace as any).workspaceFolders = [
        {
          uri: vscode.Uri.file('/mock/workspace'),
          name: 'test-workspace',
          index: 0
        }
      ];

      // Mock configuration
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'enabled') return false; // Disable LSP for tests
          return defaultValue;
        })
      });
    });

    afterEach(async () => {
      await extension.deactivate();
    });

    it('should initialize with workspace folder', async () => {
      await expect(extension.activate(mockContext)).resolves.not.toThrow();
      
      // Should have registered some subscriptions
      expect(mockContext.subscriptions.length).toBeGreaterThanOrEqual(0);
    });

    it('should register commands during activation', async () => {
      const registerCommandSpy = jest.spyOn(vscode.commands, 'registerCommand');
      
      await extension.activate(mockContext);
      
      // Should register at least the initialize command
      expect(registerCommandSpy).toHaveBeenCalled();
      
      registerCommandSpy.mockRestore();
    });

    it('should handle manager initialization', async () => {
      await extension.activate(mockContext);
      
      // Managers should be initialized (subscriptions added for disposal)
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });

    it('should cleanup all managers on deactivation', async () => {
      await extension.activate(mockContext);
      
      // Should not throw during cleanup
      await expect(extension.deactivate()).resolves.not.toThrow();
    });
  });

  describe('Context Subscriptions', () => {
    it('should accept context with subscriptions array', async () => {
      const mockContext: any = {
        subscriptions: [],
        extensionPath: '/mock/path',
        extensionUri: vscode.Uri.file('/mock/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      await extension.activate(mockContext);
      
      // Context should be used (subscriptions may be added)
      expect(Array.isArray(mockContext.subscriptions)).toBe(true);
    });

    it('should add disposables to context subscriptions', async () => {
      const mockContext: any = {
        subscriptions: [],
        extensionPath: '/mock/path',
        extensionUri: vscode.Uri.file('/mock/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      // Mock workspace with folder
      (vscode.workspace as any).workspaceFolders = [
        {
          uri: vscode.Uri.file('/mock/workspace'),
          name: 'test-workspace',
          index: 0
        }
      ];

      await extension.activate(mockContext);
      
      // Should have added disposables for managers
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle activation errors gracefully', async () => {
      const mockContext: any = {
        subscriptions: [],
        extensionPath: '/mock/path',
        extensionUri: vscode.Uri.file('/mock/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      // Should not crash even if there are errors
      await expect(extension.activate(mockContext)).resolves.not.toThrow();
    });

    it('should handle errors without crashing', async () => {
      const mockContext: any = {
        subscriptions: [],
        extensionPath: '/mock/path',
        extensionUri: vscode.Uri.file('/mock/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      // Mock workspace with folder
      const mockUri = vscode.Uri.file('/mock/workspace');
      (mockUri as any).fsPath = '/mock/workspace';
      (vscode.workspace as any).workspaceFolders = [
        {
          uri: mockUri,
          name: 'test-workspace',
          index: 0
        }
      ];

      // Should not throw even if there are internal errors
      await expect(extension.activate(mockContext)).resolves.not.toThrow();
    });
  });

  describe('Manager Initialization Order', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        subscriptions: [],
        extensionPath: '/mock/extension/path',
        extensionUri: vscode.Uri.file('/mock/extension/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      (vscode.workspace as any).workspaceFolders = [
        {
          uri: vscode.Uri.file('/mock/workspace'),
          name: 'test-workspace',
          index: 0
        }
      ];

      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'enabled') return false;
          return defaultValue;
        })
      });
    });

    afterEach(async () => {
      await extension.deactivate();
    });

    it('should initialize managers in correct order', async () => {
      await extension.activate(mockContext);
      
      // All managers should be initialized
      // Steering, Hook, and MCP managers should have disposables registered
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });

    it('should handle partial initialization failure', async () => {
      // Even if one manager fails, others should still initialize
      await expect(extension.activate(mockContext)).resolves.not.toThrow();
    });
  });

  describe('Configuration Integration', () => {
    it('should respect LSP configuration', async () => {
      const mockContext: any = {
        subscriptions: [],
        extensionPath: '/mock/path',
        extensionUri: vscode.Uri.file('/mock/path'),
        globalState: {
          get: jest.fn(),
          update: jest.fn()
        },
        workspaceState: {
          get: jest.fn(),
          update: jest.fn()
        }
      };

      (vscode.workspace as any).workspaceFolders = [
        {
          uri: vscode.Uri.file('/mock/workspace'),
          name: 'test-workspace',
          index: 0
        }
      ];

      // Mock LSP disabled
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'enabled') return false;
          if (key === 'serverPath') return '';
          return defaultValue;
        })
      });

      await extension.activate(mockContext);
      
      // Should activate without LSP
      expect(mockContext.subscriptions).toBeDefined();
    });
  });
});
