import * as vscode from 'vscode';

/**
 * Configuration reader utility for Project Extension Grammar settings
 */
export class ConfigurationManager {
  private static readonly CONFIG_SECTION = 'projectExtensionGrammar';

  /**
   * Get the configuration object for the extension
   */
  private static getConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(this.CONFIG_SECTION);
  }

  /**
   * LSP Configuration
   */
  static get lsp() {
    return {
      /**
       * Check if LSP integration is enabled
       */
      isEnabled(): boolean {
        return ConfigurationManager.getConfig().get<boolean>('lsp.enabled', true);
      },

      /**
       * Get the path to the language server executable
       * @returns Path to server or empty string for bundled server
       */
      getServerPath(): string {
        return ConfigurationManager.getConfig().get<string>('lsp.serverPath', '');
      }
    };
  }

  /**
   * Steering Configuration
   */
  static get steering() {
    return {
      /**
       * Check if auto-loading of steering files is enabled
       */
      isAutoLoadEnabled(): boolean {
        return ConfigurationManager.getConfig().get<boolean>('steering.autoLoad', true);
      }
    };
  }

  /**
   * Hooks Configuration
   */
  static get hooks() {
    return {
      /**
       * Check if agent hooks are enabled
       */
      isEnabled(): boolean {
        return ConfigurationManager.getConfig().get<boolean>('hooks.enabled', true);
      }
    };
  }

  /**
   * MCP Configuration
   */
  static get mcp() {
    return {
      /**
       * Check if MCP server integration is enabled
       */
      isEnabled(): boolean {
        return ConfigurationManager.getConfig().get<boolean>('mcp.enabled', true);
      }
    };
  }

  /**
   * Watch for configuration changes
   * @param callback Function to call when configuration changes
   * @returns Disposable to stop watching
   */
  static onConfigurationChanged(
    callback: (e: vscode.ConfigurationChangeEvent) => void
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.CONFIG_SECTION)) {
        callback(e);
      }
    });
  }

  /**
   * Check if a specific configuration key has changed
   * @param e Configuration change event
   * @param key Configuration key (e.g., 'lsp.enabled')
   */
  static hasChanged(e: vscode.ConfigurationChangeEvent, key: string): boolean {
    return e.affectsConfiguration(`${this.CONFIG_SECTION}.${key}`);
  }
}
