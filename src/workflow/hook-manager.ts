import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import Ajv, { JSONSchemaType } from 'ajv';
import { minimatch } from 'minimatch';
import { createLogger, Logger } from '../utils/logger';
import { createErrorHandler, ErrorHandler, ErrorCategory } from '../utils/error-handler';

export type TriggerType = 'onSave' | 'onFileCreate' | 'onPreCommit' | 'manual';
export type ActionType = 'prompt' | 'command';

export interface HookTrigger {
  type: TriggerType;
  filePattern?: string;
}

export interface HookAction {
  type: ActionType;
  prompt?: string;
  command?: string;
}

export interface Hook {
  name: string;
  trigger: HookTrigger;
  action: HookAction;
  enabled?: boolean;
  preventRecursion?: boolean;
}

export interface HookContext {
  document?: vscode.TextDocument;
  changes?: vscode.TextDocumentChangeEvent;
  workspace?: vscode.WorkspaceFolder;
}

// JSON Schema for hook validation
const hookSchema: JSONSchemaType<Hook> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    trigger: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['onSave', 'onFileCreate', 'onPreCommit', 'manual'] },
        filePattern: { type: 'string', nullable: true }
      },
      required: ['type'],
      additionalProperties: false
    },
    action: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['prompt', 'command'] },
        prompt: { type: 'string', nullable: true },
        command: { type: 'string', nullable: true }
      },
      required: ['type'],
      additionalProperties: false
    },
    enabled: { type: 'boolean', nullable: true },
    preventRecursion: { type: 'boolean', nullable: true }
  },
  required: ['name', 'trigger', 'action'],
  additionalProperties: false
};

export class HookManager {
  private hooks: Map<string, Hook> = new Map();
  private workspaceRoot: string;
  private fileWatcher: vscode.FileSystemWatcher | null = null;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.logger = createLogger('HookManager');
    this.errorHandler = createErrorHandler(this.logger);
    this.setupFileWatcher();
  }

  /**
   * Sets up file watcher for hook configuration changes
   */
  private setupFileWatcher(): void {
    const hookPattern = new vscode.RelativePattern(
      this.workspaceRoot,
      '.kiro/hooks/**/*.json'
    );

    this.fileWatcher = vscode.workspace.createFileSystemWatcher(hookPattern);

    this.fileWatcher.onDidChange((uri) => {
      this.logger.debug(`Hook configuration changed: ${uri.fsPath}`);
      this.loadHooks();
    });

    this.fileWatcher.onDidCreate((uri) => {
      this.logger.debug(`Hook configuration created: ${uri.fsPath}`);
      this.loadHooks();
    });

    this.fileWatcher.onDidDelete((uri) => {
      this.logger.debug(`Hook configuration deleted: ${uri.fsPath}`);
      this.loadHooks();
    });
  }

  /**
   * Loads all hooks from the .kiro/hooks directory
   */
  async loadHooks(): Promise<Hook[]> {
    this.hooks.clear();

    const hooksDir = path.join(this.workspaceRoot, '.kiro', 'hooks');

    if (!fs.existsSync(hooksDir)) {
      return [];
    }

    const files = this.findHookFiles(hooksDir);

    for (const filePath of files) {
      try {
        const hook = this.loadHookFile(filePath);
        
        if (hook && this.validateHook(hook)) {
          this.hooks.set(hook.name, hook);
        }
      } catch (error: any) {
        console.error(`Error loading hook file ${filePath}:`, error);
        vscode.window.showErrorMessage(
          `Failed to load hook from ${path.basename(filePath)}: ${error.message}`
        );
      }
    }

    return Array.from(this.hooks.values());
  }

  /**
   * Loads a single hook file
   */
  private loadHookFile(filePath: string): Hook | null {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hook = JSON.parse(content) as Hook;

    // Set defaults
    if (hook.enabled === undefined) {
      hook.enabled = true;
    }
    if (hook.preventRecursion === undefined) {
      hook.preventRecursion = true;
    }

    return hook;
  }

  /**
   * Validates a hook configuration
   */
  private validateHook(hook: Hook): boolean {
    const ajv = new Ajv();
    const validate = ajv.compile(hookSchema);
    const valid = validate(hook);

    if (!valid && validate.errors) {
      const errors = validate.errors.map(e => `${e.instancePath}: ${e.message}`).join(', ');
      throw new Error(`Hook validation failed: ${errors}`);
    }

    // Additional validation
    if (hook.action.type === 'prompt' && !hook.action.prompt) {
      throw new Error('Prompt action requires a prompt field');
    }

    if (hook.action.type === 'command' && !hook.action.command) {
      throw new Error('Command action requires a command field');
    }

    return true;
  }

  /**
   * Registers a hook
   */
  registerHook(hook: Hook): void {
    if (this.validateHook(hook)) {
      this.hooks.set(hook.name, hook);
    }
  }

  /**
   * Gets all registered hooks
   */
  getHooks(): Hook[] {
    return Array.from(this.hooks.values());
  }

  /**
   * Gets hooks that match a trigger type
   */
  getHooksByTrigger(triggerType: TriggerType): Hook[] {
    return Array.from(this.hooks.values()).filter(
      hook => hook.enabled && hook.trigger.type === triggerType
    );
  }

  /**
   * Checks if a hook should be triggered for a file
   */
  shouldTriggerHook(hook: Hook, filePath: string): boolean {
    if (!hook.enabled) {
      return false;
    }

    const { filePattern } = hook.trigger;

    if (!filePattern) {
      return true;
    }

    try {
      const normalizedPath = filePath.replace(/\\/g, '/');
      return minimatch(normalizedPath, filePattern, { matchBase: true });
    } catch (error) {
      console.error(`Invalid file pattern in hook ${hook.name}:`, error);
      return false;
    }
  }

  /**
   * Finds all hook files in a directory
   */
  private findHookFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.findHookFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Disposes resources
   */
  dispose(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
      this.fileWatcher = null;
    }
    this.hooks.clear();
  }
}
