import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { createLogger, Logger } from '../utils/logger';

export interface LSPClientConfig {
  serverPath: string;
  serverArgs?: string[];
  enabled: boolean;
  timeout?: number;
}

export class LSPClientManager {
  private client: LanguageClient | null = null;
  private config: LSPClientConfig;
  private retryCount = 0;
  private maxRetries = 3;
  private baseRetryDelay = 1000; // 1 second
  private isStarting = false;
  private logger: Logger;

  constructor(config: LSPClientConfig) {
    this.config = config;
    this.logger = createLogger('LSPClient');
  }

  /**
   * Starts the Language Server
   */
  async start(): Promise<void> {
    if (this.isStarting) {
      this.logger.debug('LSP client is already starting');
      return;
    }

    if (this.client) {
      this.logger.debug('LSP client is already running');
      return;
    }

    if (!this.config.enabled) {
      this.logger.info('LSP client is disabled');
      return;
    }

    this.isStarting = true;

    try {
      const serverOptions: ServerOptions = {
        run: {
          module: this.config.serverPath,
          transport: TransportKind.ipc,
          args: this.config.serverArgs || []
        },
        debug: {
          module: this.config.serverPath,
          transport: TransportKind.ipc,
          args: this.config.serverArgs || [],
          options: {
            execArgv: ['--nolazy', '--inspect=6009']
          }
        }
      };

      const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'targetlang' }],
        synchronize: {
          fileEvents: vscode.workspace.createFileSystemWatcher('**/*.targetlang')
        }
      };

      this.client = new LanguageClient(
        'targetlangServer',
        'Target Language Server',
        serverOptions,
        clientOptions
      );

      // Set up error handlers
      this.client.onDidChangeState((event) => {
        this.logger.debug(`LSP client state changed: ${event.oldState} -> ${event.newState}`);
      });

      await this.client.start();
      this.retryCount = 0;
      this.logger.info('LSP client started successfully');
    } catch (error: any) {
      this.logger.error('Failed to start LSP client', error);
      await this.handleStartFailure(error);
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Stops the Language Server
   */
  async stop(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.stop();
      this.client = null;
      this.logger.info('LSP client stopped');
    } catch (error: any) {
      this.logger.error('Error stopping LSP client', error);
      this.client = null;
    }
  }

  /**
   * Restarts the Language Server
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * Sends a request to the Language Server with timeout
   */
  async sendRequest<T>(method: string, params: any): Promise<T> {
    if (!this.client) {
      throw new Error('LSP client is not running');
    }

    const timeout = this.config.timeout || 500;

    return Promise.race([
      this.client.sendRequest<T>(method, params),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
      )
    ]);
  }

  /**
   * Registers a notification handler
   */
  onNotification(method: string, handler: (params: any) => void): void {
    if (!this.client) {
      throw new Error('LSP client is not running');
    }

    this.client.onNotification(method, handler);
  }

  /**
   * Checks if the client is running
   */
  isRunning(): boolean {
    return this.client !== null;
  }

  /**
   * Gets the underlying LanguageClient instance
   */
  getClient(): LanguageClient | null {
    return this.client;
  }

  /**
   * Handles start failure with exponential backoff retry
   */
  private async handleStartFailure(error: any): Promise<void> {
    this.client = null;

    if (this.retryCount >= this.maxRetries) {
      vscode.window.showErrorMessage(
        `Failed to start Language Server after ${this.maxRetries} attempts. ` +
        `Please check the server configuration and try restarting manually.`,
        'Restart Language Server'
      ).then(action => {
        if (action === 'Restart Language Server') {
          this.retryCount = 0;
          this.restart();
        }
      });
      return;
    }

    this.retryCount++;
    const delay = this.baseRetryDelay * Math.pow(2, this.retryCount - 1);
    
    this.logger.info(`Retrying LSP client start in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    await this.start();
  }
}
