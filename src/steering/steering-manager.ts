import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { minimatch } from 'minimatch';
import { createLogger, Logger } from '../utils/logger';
import { createErrorHandler, ErrorHandler, ErrorCategory } from '../utils/error-handler';

export interface SteeringFileFrontmatter {
  inclusion: 'always' | 'fileMatch' | 'manual';
  fileMatchPattern?: string;
  priority?: number;
}

export interface SteeringFile {
  path: string;
  content: string;
  frontmatter: SteeringFileFrontmatter;
}

export interface FileContext {
  document?: vscode.TextDocument;
  workspaceFolder?: vscode.WorkspaceFolder;
}

interface CachedSteeringFile {
  data: SteeringFile;
  timestamp: number;
}

export class SteeringManager {
  private cache: Map<string, CachedSteeringFile> = new Map();
  private fileWatcher: vscode.FileSystemWatcher | null = null;
  private workspaceRoot: string;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private readonly TTL = 60000; // 1 minute cache TTL

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.logger = createLogger('SteeringManager');
    this.errorHandler = createErrorHandler(this.logger);
    this.setupFileWatcher();
  }

  /**
   * Sets up file watcher for automatic reload on changes
   */
  private setupFileWatcher(): void {
    const steeringPattern = new vscode.RelativePattern(
      this.workspaceRoot,
      '.kiro/steering/**/*.md'
    );

    this.fileWatcher = vscode.workspace.createFileSystemWatcher(steeringPattern);

    this.fileWatcher.onDidChange((uri) => {
      this.logger.debug(`Steering file changed: ${uri.fsPath}`);
      this.cache.delete(uri.fsPath);
    });

    this.fileWatcher.onDidCreate((uri) => {
      this.logger.debug(`Steering file created: ${uri.fsPath}`);
      this.cache.delete(uri.fsPath);
    });

    this.fileWatcher.onDidDelete((uri) => {
      this.logger.debug(`Steering file deleted: ${uri.fsPath}`);
      this.cache.delete(uri.fsPath);
    });
  }

  /**
   * Loads steering files based on context
   */
  async loadSteeringFiles(context: FileContext): Promise<SteeringFile[]> {
    const steeringDir = path.join(this.workspaceRoot, '.kiro', 'steering');

    if (!fs.existsSync(steeringDir)) {
      return [];
    }

    const files = this.findSteeringFiles(steeringDir);
    const loadedFiles: SteeringFile[] = [];

    for (const filePath of files) {
      try {
        const steeringFile = await this.loadSteeringFile(filePath);
        
        if (this.shouldLoadFile(steeringFile, context)) {
          loadedFiles.push(steeringFile);
        }
      } catch (error: any) {
        console.error(`Error loading steering file ${filePath}:`, error);
      }
    }

    // Sort by priority (higher priority first)
    loadedFiles.sort((a, b) => {
      const priorityA = a.frontmatter.priority || 0;
      const priorityB = b.frontmatter.priority || 0;
      return priorityB - priorityA;
    });

    return loadedFiles;
  }

  /**
   * Gets active rules for a document
   */
  async getActiveRules(document: vscode.TextDocument): Promise<string[]> {
    const context: FileContext = { document };
    const files = await this.loadSteeringFiles(context);
    return files.map(f => f.content);
  }

  /**
   * Loads a single steering file with TTL caching
   */
  private async loadSteeringFile(filePath: string): Promise<SteeringFile> {
    // Check cache first and validate TTL
    const cached = this.cache.get(filePath);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      this.logger.debug(`Cache hit for steering file: ${filePath}`);
      return cached.data;
    }

    this.logger.debug(`Loading steering file from disk: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(content);

    const steeringFile: SteeringFile = {
      path: filePath,
      content: parsed.content,
      frontmatter: {
        inclusion: parsed.data.inclusion || 'always',
        fileMatchPattern: parsed.data.fileMatchPattern,
        priority: parsed.data.priority || 0
      }
    };

    // Cache the file with timestamp
    this.cache.set(filePath, {
      data: steeringFile,
      timestamp: Date.now()
    });

    return steeringFile;
  }

  /**
   * Determines if a steering file should be loaded based on context
   */
  private shouldLoadFile(file: SteeringFile, context: FileContext): boolean {
    const { inclusion, fileMatchPattern } = file.frontmatter;

    switch (inclusion) {
      case 'always':
        return true;

      case 'fileMatch':
        if (!fileMatchPattern || !context.document) {
          return false;
        }
        return this.matchesPattern(context.document.uri.fsPath, fileMatchPattern);

      case 'manual':
        return false;

      default:
        return false;
    }
  }

  /**
   * Checks if a file path matches a pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    try {
      return minimatch(filePath, pattern, { matchBase: true });
    } catch (error) {
      console.error(`Invalid pattern: ${pattern}`, error);
      return false;
    }
  }

  /**
   * Finds all steering files in a directory
   */
  private findSteeringFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.findSteeringFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Disposes resources
   */
  dispose(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
      this.fileWatcher = null;
    }
    this.cache.clear();
  }
}
