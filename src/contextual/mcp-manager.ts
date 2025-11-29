import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { createLogger, Logger } from '../utils/logger';
import { createErrorHandler, ErrorHandler, ErrorCategory } from '../utils/error-handler';

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  disabled?: boolean;
  autoApprove?: string[];
}

export interface ServerStatus {
  running: boolean;
  lastHealthCheck?: Date;
  restartCount: number;
}

export class MCPManager {
  private servers: Map<string, child_process.ChildProcess> = new Map();
  private serverStatus: Map<string, ServerStatus> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private maxRestarts = 3;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor() {
    this.logger = createLogger('MCPManager');
    this.errorHandler = createErrorHandler(this.logger);
  }

  /**
   * Registers and starts an MCP server
   */
  async registerServer(name: string, config: MCPServerConfig): Promise<void> {
    if (config.disabled) {
      this.logger.info(`MCP server ${name} is disabled`);
      return;
    }

    try {
      await this.startServer(name, config);
      
      this.serverStatus.set(name, {
        running: true,
        lastHealthCheck: new Date(),
        restartCount: 0
      });

      this.logger.info(`MCP server ${name} registered successfully`);
    } catch (error: any) {
      this.logger.error(`Failed to register MCP server ${name}`, error);
      vscode.window.showErrorMessage(
        `Failed to start MCP server "${name}": ${error.message}`
      );
    }
  }

  /**
   * Starts an MCP server process
   */
  private async startServer(name: string, config: MCPServerConfig): Promise<void> {
    const serverProcess = child_process.spawn(config.command, config.args, {
      env: { ...process.env, ...config.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    serverProcess.on('error', (error: any) => {
      console.error(`MCP server ${name} error:`, error);
      this.handleServerCrash(name, config);
    });

    serverProcess.on('exit', (code: number | null) => {
      this.logger.warn(`MCP server ${name} exited with code ${code}`);
      this.handleServerCrash(name, config);
    });

    this.servers.set(name, serverProcess);
  }

  /**
   * Handles server crash and attempts restart
   */
  private async handleServerCrash(name: string, config: MCPServerConfig): Promise<void> {
    const status = this.serverStatus.get(name);
    
    if (!status) {
      return;
    }

    status.running = false;
    status.restartCount++;

    if (status.restartCount <= this.maxRestarts) {
      this.logger.info(`Attempting to restart MCP server ${name} (attempt ${status.restartCount}/${this.maxRestarts})`);
      
      try {
        await this.startServer(name, config);
        status.running = true;
        vscode.window.showInformationMessage(`MCP server "${name}" restarted successfully`);
      } catch (error: any) {
        console.error(`Failed to restart MCP server ${name}:`, error);
        
        if (status.restartCount >= this.maxRestarts) {
          vscode.window.showErrorMessage(
            `MCP server "${name}" failed to restart after ${this.maxRestarts} attempts. Please check the configuration.`
          );
        }
      }
    }
  }

  /**
   * Gets the status of a server
   */
  getServerStatus(name: string): ServerStatus | undefined {
    return this.serverStatus.get(name);
  }

  /**
   * Calls a tool on an MCP server
   */
  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const process = this.servers.get(serverName);
    
    if (!process) {
      throw new Error(`MCP server ${serverName} is not running`);
    }

    // In a real implementation, this would send a JSON-RPC request to the server
    // For now, we'll just log it
    this.logger.debug(`Calling tool ${toolName} on server ${serverName} with args:`, args);
    
    return {
      success: true,
      result: `Tool ${toolName} executed`
    };
  }

  /**
   * Lists available tools from a server
   */
  async listTools(serverName: string): Promise<string[]> {
    const process = this.servers.get(serverName);
    
    if (!process) {
      throw new Error(`MCP server ${serverName} is not running`);
    }

    // In a real implementation, this would query the server for available tools
    return [];
  }

  /**
   * Starts health check monitoring
   */
  startHealthCheck(): void {
    if (this.healthCheckInterval) {
      return;
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // 30 seconds
  }

  /**
   * Performs health check on all servers
   */
  private performHealthCheck(): void {
    for (const [name, status] of this.serverStatus.entries()) {
      const process = this.servers.get(name);
      
      if (process && !process.killed) {
        status.lastHealthCheck = new Date();
        status.running = true;
      } else {
        status.running = false;
      }
    }
  }

  /**
   * Stops health check monitoring
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Stops all MCP servers
   */
  dispose(): void {
    this.stopHealthCheck();

    for (const [name, process] of this.servers.entries()) {
      try {
        process.kill();
        this.logger.info(`Stopped MCP server ${name}`);
      } catch (error) {
        this.logger.error(`Error stopping MCP server ${name}`, error);
      }
    }

    this.servers.clear();
    this.serverStatus.clear();
  }
}
