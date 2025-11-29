import { ConfigurationManager } from '../../src/utils/config';
import * as vscode from 'vscode';

describe('ConfigurationManager', () => {
  describe('LSP Configuration', () => {
    it('should provide LSP enabled status', () => {
      const isEnabled = ConfigurationManager.lsp.isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should provide LSP server path', () => {
      const serverPath = ConfigurationManager.lsp.getServerPath();
      expect(typeof serverPath).toBe('string');
    });

    it('should default to enabled for LSP', () => {
      const isEnabled = ConfigurationManager.lsp.isEnabled();
      expect(isEnabled).toBe(true);
    });

    it('should default to empty string for server path', () => {
      const serverPath = ConfigurationManager.lsp.getServerPath();
      expect(serverPath).toBe('');
    });
  });

  describe('Steering Configuration', () => {
    it('should provide steering auto-load status', () => {
      const isAutoLoad = ConfigurationManager.steering.isAutoLoadEnabled();
      expect(typeof isAutoLoad).toBe('boolean');
    });

    it('should default to enabled for auto-load', () => {
      const isAutoLoad = ConfigurationManager.steering.isAutoLoadEnabled();
      expect(isAutoLoad).toBe(true);
    });
  });

  describe('Hooks Configuration', () => {
    it('should provide hooks enabled status', () => {
      const isEnabled = ConfigurationManager.hooks.isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should default to enabled for hooks', () => {
      const isEnabled = ConfigurationManager.hooks.isEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  describe('MCP Configuration', () => {
    it('should provide MCP enabled status', () => {
      const isEnabled = ConfigurationManager.mcp.isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should default to enabled for MCP', () => {
      const isEnabled = ConfigurationManager.mcp.isEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  describe('Configuration Change Detection', () => {
    it('should detect configuration section changes', () => {
      const mockEvent = {
        affectsConfiguration: jest.fn((section: string) => {
          return section === 'projectExtensionGrammar' || 
                 section.startsWith('projectExtensionGrammar.');
        })
      } as unknown as vscode.ConfigurationChangeEvent;

      expect(ConfigurationManager.hasChanged(mockEvent, 'lsp.enabled')).toBe(true);
      expect(mockEvent.affectsConfiguration).toHaveBeenCalledWith('projectExtensionGrammar.lsp.enabled');
    });

    it('should not detect changes in other sections', () => {
      const mockEvent = {
        affectsConfiguration: jest.fn((section: string) => {
          return section === 'otherExtension';
        })
      } as unknown as vscode.ConfigurationChangeEvent;

      expect(ConfigurationManager.hasChanged(mockEvent, 'lsp.enabled')).toBe(false);
    });
  });

  describe('Configuration Watcher', () => {
    it('should provide a disposable for configuration changes', () => {
      const callback = jest.fn();
      const disposable = ConfigurationManager.onConfigurationChanged(callback);
      
      expect(disposable).toBeDefined();
      expect(typeof disposable.dispose).toBe('function');
      
      disposable.dispose();
    });
  });
});
