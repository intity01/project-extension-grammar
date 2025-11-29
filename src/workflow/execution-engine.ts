import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { Hook, HookContext } from './hook-manager';
import { createLogger, Logger } from '../utils/logger';

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}

export interface ExecutionRecord {
  hookName: string;
  timestamp: Date;
  result: ExecutionResult;
  context: HookContext;
}

export class ExecutionEngine {
  private executionHistory: ExecutionRecord[] = [];
  private maxHistorySize = 100;
  private defaultTimeout = 30000; // 30 seconds
  private logger: Logger;

  constructor() {
    this.logger = createLogger('ExecutionEngine');
  }

  /**
   * Executes a hook with the given context
   */
  async execute(hook: Hook, context: HookContext): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      let result: ExecutionResult;

      if (hook.action.type === 'prompt') {
        result = await this.executePromptAction(hook, context);
      } else if (hook.action.type === 'command') {
        result = await this.executeCommandAction(hook, context);
      } else {
        throw new Error(`Unknown action type: ${hook.action.type}`);
      }

      result.duration = Date.now() - startTime;

      // Add to history
      this.addToHistory({
        hookName: hook.name,
        timestamp: new Date(),
        result,
        context
      });

      // Show result to user
      this.showResult(hook, result);

      return result;
    } catch (error: any) {
      const result: ExecutionResult = {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };

      this.addToHistory({
        hookName: hook.name,
        timestamp: new Date(),
        result,
        context
      });

      this.showResult(hook, result);

      return result;
    }
  }

  /**
   * Executes a prompt-based action
   */
  private async executePromptAction(hook: Hook, context: HookContext): Promise<ExecutionResult> {
    if (!hook.action.prompt) {
      throw new Error('Prompt action requires a prompt field');
    }

    // Build the execution context
    const contextInfo = this.buildContextInfo(context);
    const fullPrompt = `${hook.action.prompt}\n\nContext:\n${contextInfo}`;

    // For now, just log the prompt (in a real implementation, this would send to AI agent)
    this.logger.debug(`Executing prompt for hook ${hook.name}:`, fullPrompt);

    return {
      success: true,
      output: `Prompt executed: ${hook.action.prompt}`,
      duration: 0
    };
  }

  /**
   * Executes a command-based action
   */
  private async executeCommandAction(hook: Hook, context: HookContext): Promise<ExecutionResult> {
    if (!hook.action.command) {
      throw new Error('Command action requires a command field');
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (process) {
          process.kill();
        }
        resolve({
          success: false,
          error: `Command timed out after ${this.defaultTimeout}ms`,
          duration: this.defaultTimeout
        });
      }, this.defaultTimeout);

      const process = child_process.exec(
        hook.action.command!,
        {
          cwd: context.workspace?.uri.fsPath
        },
        (error, stdout, stderr) => {
          clearTimeout(timeout);

          if (error) {
            resolve({
              success: false,
              output: stdout,
              error: stderr || error.message,
              duration: 0
            });
          } else {
            resolve({
              success: true,
              output: stdout,
              error: stderr || undefined,
              duration: 0
            });
          }
        }
      );
    });
  }

  /**
   * Builds context information for execution
   */
  private buildContextInfo(context: HookContext): string {
    const info: string[] = [];

    if (context.document) {
      info.push(`File: ${context.document.uri.fsPath}`);
      info.push(`Language: ${context.document.languageId}`);
    }

    if (context.workspace) {
      info.push(`Workspace: ${context.workspace.name}`);
    }

    return info.join('\n');
  }

  /**
   * Shows execution result to user
   */
  private showResult(hook: Hook, result: ExecutionResult): void {
    if (result.success) {
      if (result.output) {
        vscode.window.showInformationMessage(
          `Hook "${hook.name}" completed successfully`
        );
      }
    } else {
      vscode.window.showErrorMessage(
        `Hook "${hook.name}" failed: ${result.error || 'Unknown error'}`
      );
    }
  }

  /**
   * Adds an execution record to history
   */
  private addToHistory(record: ExecutionRecord): void {
    this.executionHistory.push(record);

    // Trim history if it exceeds max size
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  /**
   * Gets execution history
   */
  getExecutionHistory(): ExecutionRecord[] {
    return [...this.executionHistory];
  }

  /**
   * Clears execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Cancels a running execution (placeholder for future implementation)
   */
  cancel(executionId: string): void {
    // TODO: Implement execution cancellation
    this.logger.info(`Cancelling execution: ${executionId}`);
  }
}
