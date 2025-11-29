import * as vscode from 'vscode';
import { LSPClientManager } from './semantic/lsp-client';
import { SemanticTokensProvider, createSemanticTokensLegend } from './semantic/semantic-tokens';
import { HoverProvider } from './semantic/hover-provider';
import { DefinitionProvider } from './semantic/definition-provider';
import { ReferencesProvider } from './semantic/references-provider';
import { SteeringManager } from './steering/steering-manager';
import { HookManager } from './workflow/hook-manager';
import { MCPManager } from './contextual/mcp-manager';
import { registerInitializeCommand } from './commands/initialize';
import { initializeLogger, getLogger, disposeLoggers, LogLevel } from './utils/logger';
import { createErrorHandler, ErrorCategory } from './utils/error-handler';
import { ConfigurationManager } from './utils/config';
import { LazyManagerContainer } from './utils/lazy-loader';

// Lazy-loaded managers for performance optimization
const lazyManagers = new LazyManagerContainer();
let workspaceRoot: string | undefined;

export async function activate(context: vscode.ExtensionContext) {
  // Initialize logger
  const logLevelConfig = vscode.workspace.getConfiguration('projectExtensionGrammar').get<string>('logLevel', 'info');
  const logLevel = logLevelConfig === 'debug' ? LogLevel.DEBUG : 
                   logLevelConfig === 'warn' ? LogLevel.WARN :
                   logLevelConfig === 'error' ? LogLevel.ERROR : LogLevel.INFO;
  
  const logger = initializeLogger(logLevel);
  const errorHandler = createErrorHandler(logger);
  
  logger.info('Project Extension Grammar is now active');

  try {
    // Get workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      logger.info('No workspace folder open, skipping manager initialization');
      return;
    }

    workspaceRoot = workspaceFolders[0].uri.fsPath;

    // Register lazy-loaded managers for performance optimization
    // Managers are only initialized when first accessed
    
    // Register LSP Client (lazy-loaded)
    lazyManagers.register('lsp', async () => {
      const lspEnabled = ConfigurationManager.lsp.isEnabled();
      const lspServerPath = ConfigurationManager.lsp.getServerPath();

      if (!lspEnabled || !lspServerPath) {
        logger.info('LSP Client is disabled or not configured');
        return null;
      }

      logger.info('Initializing LSP Client (lazy)');
      const client = new LSPClientManager({
        serverPath: lspServerPath,
        enabled: true,
        timeout: 500
      });

      await client.start();

      // Register semantic token provider
      const legend = createSemanticTokensLegend();
      const semanticTokensProvider = new SemanticTokensProvider(client);
      context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
          { language: 'targetlang' },
          semanticTokensProvider,
          legend
        )
      );

      // Register capability providers
      context.subscriptions.push(
        vscode.languages.registerHoverProvider(
          { language: 'targetlang' },
          new HoverProvider(client)
        )
      );

      context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
          { language: 'targetlang' },
          new DefinitionProvider(client)
        )
      );

      context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
          { language: 'targetlang' },
          new ReferencesProvider(client)
        )
      );
      
      logger.info('LSP Client initialized successfully');
      return client;
    });

    // Register Steering Manager (lazy-loaded)
    lazyManagers.register('steering', async () => {
      if (!ConfigurationManager.steering.isAutoLoadEnabled()) {
        logger.info('Steering Manager is disabled');
        return null;
      }

      logger.info('Initializing Steering Manager (lazy)');
      const manager = new SteeringManager(workspaceRoot!);
      context.subscriptions.push({
        dispose: () => manager.dispose()
      });
      logger.info('Steering Manager initialized successfully');
      return manager;
    });

    // Register Hook Manager (lazy-loaded)
    lazyManagers.register('hooks', async () => {
      if (!ConfigurationManager.hooks.isEnabled()) {
        logger.info('Hook Manager is disabled');
        return null;
      }

      logger.info('Initializing Hook Manager (lazy)');
      const manager = new HookManager(workspaceRoot!);
      await manager.loadHooks();
      context.subscriptions.push({
        dispose: () => manager.dispose()
      });
      logger.info('Hook Manager initialized successfully');
      return manager;
    });

    // Register MCP Manager (lazy-loaded)
    lazyManagers.register('mcp', async () => {
      if (!ConfigurationManager.mcp.isEnabled()) {
        logger.info('MCP Manager is disabled');
        return null;
      }

      logger.info('Initializing MCP Manager (lazy)');
      const manager = new MCPManager();
      manager.startHealthCheck();
      context.subscriptions.push({
        dispose: () => manager.dispose()
      });
      logger.info('MCP Manager initialized successfully');
      return manager;
    });

    // Trigger LSP initialization on first targetlang file open
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(async (document) => {
        if (document.languageId === 'targetlang' && !lazyManagers.isInitialized('lsp')) {
          await errorHandler.withErrorBoundary(
            async () => await lazyManagers.get('lsp'),
            'LSP Client Initialization',
            ErrorCategory.RUNTIME,
            false
          );
        }
      })
    );

    // Register commands
    registerInitializeCommand(context);

    logger.info('Extension activated with lazy-loaded managers');

  } catch (error: any) {
    logger.error('Critical error during extension activation', error);
    errorHandler.handleRuntimeError(error, 'Extension Activation');
  }
}

export async function deactivate() {
  const logger = getLogger();
  logger.info('Project Extension Grammar is deactivating');

  try {
    // Cleanup lazy-loaded managers
    const lspClient = lazyManagers.getSync<LSPClientManager>('lsp');
    if (lspClient) {
      await lspClient.stop();
      logger.info('LSP Client stopped');
    }

    const steeringManager = lazyManagers.getSync<SteeringManager>('steering');
    if (steeringManager) {
      steeringManager.dispose();
      logger.info('Steering Manager disposed');
    }

    const hookManager = lazyManagers.getSync<HookManager>('hooks');
    if (hookManager) {
      hookManager.dispose();
      logger.info('Hook Manager disposed');
    }

    const mcpManager = lazyManagers.getSync<MCPManager>('mcp');
    if (mcpManager) {
      mcpManager.dispose();
      logger.info('MCP Manager disposed');
    }

    // Reset all lazy loaders
    lazyManagers.resetAll();

    logger.info('All resources cleaned up');
  } catch (error: any) {
    logger.error('Error during deactivation', error);
  } finally {
    // Dispose loggers last
    disposeLoggers();
  }
}
