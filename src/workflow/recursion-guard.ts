import { Hook, HookContext } from './hook-manager';

interface ExecutionStackEntry {
  hookName: string;
  filePath: string;
  timestamp: number;
}

export class RecursionGuard {
  private executionStack: ExecutionStackEntry[] = [];
  private maxStackDepth = 10;
  private cooldownPeriod = 1000; // 1 second

  /**
   * Checks if a hook execution would cause recursion
   */
  wouldCauseRecursion(hook: Hook, context: HookContext): boolean {
    if (!hook.preventRecursion) {
      return false;
    }

    const filePath = context.document?.uri.fsPath || '';

    // Check if this hook is already in the execution stack for the same file
    const existingEntry = this.executionStack.find(
      entry => entry.hookName === hook.name && entry.filePath === filePath
    );

    if (existingEntry) {
      // Check if we're within the cooldown period
      const timeSinceLastExecution = Date.now() - existingEntry.timestamp;
      if (timeSinceLastExecution < this.cooldownPeriod) {
        return true;
      }
    }

    // Check stack depth
    if (this.executionStack.length >= this.maxStackDepth) {
      console.warn(`Execution stack depth limit reached (${this.maxStackDepth})`);
      return true;
    }

    return false;
  }

  /**
   * Marks the start of a hook execution
   */
  enterExecution(hook: Hook, context: HookContext): void {
    const filePath = context.document?.uri.fsPath || '';

    this.executionStack.push({
      hookName: hook.name,
      filePath,
      timestamp: Date.now()
    });

    // Clean up old entries
    this.cleanupStack();
  }

  /**
   * Marks the end of a hook execution
   */
  exitExecution(hook: Hook, context: HookContext): void {
    const filePath = context.document?.uri.fsPath || '';

    // Remove the most recent matching entry
    const index = this.executionStack.findIndex(
      entry => entry.hookName === hook.name && entry.filePath === filePath
    );

    if (index !== -1) {
      this.executionStack.splice(index, 1);
    }
  }

  /**
   * Cleans up old entries from the stack
   */
  private cleanupStack(): void {
    const now = Date.now();
    const maxAge = 60000; // 1 minute

    this.executionStack = this.executionStack.filter(
      entry => now - entry.timestamp < maxAge
    );
  }

  /**
   * Gets the current execution stack
   */
  getExecutionStack(): ExecutionStackEntry[] {
    return [...this.executionStack];
  }

  /**
   * Clears the execution stack
   */
  clearStack(): void {
    this.executionStack = [];
  }

  /**
   * Gets the current stack depth
   */
  getStackDepth(): number {
    return this.executionStack.length;
  }

  /**
   * Checks if a specific hook is currently executing
   */
  isExecuting(hookName: string, filePath?: string): boolean {
    if (filePath) {
      return this.executionStack.some(
        entry => entry.hookName === hookName && entry.filePath === filePath
      );
    }

    return this.executionStack.some(entry => entry.hookName === hookName);
  }
}
