import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface InitializationResult {
  success: boolean;
  filesCreated: string[];
  filesSkipped: string[];
  errors: string[];
}

/**
 * Initializes Kiro support for the current workspace
 */
export async function initializeKiro(workspaceRoot: string): Promise<InitializationResult> {
  const result: InitializationResult = {
    success: true,
    filesCreated: [],
    filesSkipped: [],
    errors: []
  };

  try {
    // Get extension path
    const extensionPath = getExtensionPath();
    if (!extensionPath) {
      result.success = false;
      result.errors.push('Could not find extension path');
      return result;
    }

    // Create .kiro directory structure
    const kiroDir = path.join(workspaceRoot, '.kiro');
    const steeringDir = path.join(kiroDir, 'steering');
    const hooksDir = path.join(kiroDir, 'hooks');

    createDirectoryIfNotExists(kiroDir);
    createDirectoryIfNotExists(steeringDir);
    createDirectoryIfNotExists(hooksDir);

    // Copy steering templates
    const steeringTemplates = discoverTemplates(extensionPath, 'steering');
    for (const template of steeringTemplates) {
      const sourcePath = path.join(extensionPath, 'assets', 'steering', template);
      const destPath = path.join(steeringDir, template);
      
      const copyResult = await copyFileWithConfirmation(sourcePath, destPath);
      if (copyResult.created) {
        result.filesCreated.push(destPath);
      } else if (copyResult.skipped) {
        result.filesSkipped.push(destPath);
      } else if (copyResult.error) {
        result.errors.push(copyResult.error);
      }
    }

    // Copy hook templates
    const hookTemplates = discoverTemplates(extensionPath, 'hooks');
    for (const template of hookTemplates) {
      const sourcePath = path.join(extensionPath, 'assets', 'hooks', template);
      const destPath = path.join(hooksDir, template);
      
      const copyResult = await copyFileWithConfirmation(sourcePath, destPath);
      if (copyResult.created) {
        result.filesCreated.push(destPath);
      } else if (copyResult.skipped) {
        result.filesSkipped.push(destPath);
      } else if (copyResult.error) {
        result.errors.push(copyResult.error);
      }
    }

    // Show success message
    if (result.filesCreated.length > 0) {
      vscode.window.showInformationMessage(
        `Kiro support initialized! Created ${result.filesCreated.length} file(s).`
      );
    } else if (result.filesSkipped.length > 0) {
      vscode.window.showInformationMessage(
        'Kiro support already initialized. No new files created.'
      );
    }

    if (result.errors.length > 0) {
      result.success = false;
      vscode.window.showErrorMessage(
        `Initialization completed with ${result.errors.length} error(s). Check the output for details.`
      );
    }

  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
    vscode.window.showErrorMessage(`Failed to initialize Kiro support: ${error.message}`);
  }

  return result;
}

/**
 * Gets the extension path
 */
function getExtensionPath(): string | undefined {
  const extension = vscode.extensions.getExtension('kiro.project-extension-grammar');
  return extension?.extensionPath;
}

/**
 * Discovers template files in the assets directory
 */
function discoverTemplates(extensionPath: string, type: 'steering' | 'hooks'): string[] {
  const templatesDir = path.join(extensionPath, 'assets', type);
  
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  const files = fs.readdirSync(templatesDir);
  return files.filter(file => {
    if (type === 'steering') {
      return file.endsWith('.md');
    } else {
      return file.endsWith('.json');
    }
  });
}

/**
 * Creates a directory if it doesn't exist
 */
function createDirectoryIfNotExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

interface CopyResult {
  created: boolean;
  skipped: boolean;
  error?: string;
}

/**
 * Copies a file with overwrite confirmation
 */
async function copyFileWithConfirmation(sourcePath: string, destPath: string): Promise<CopyResult> {
  // Check if source exists
  if (!fs.existsSync(sourcePath)) {
    return {
      created: false,
      skipped: false,
      error: `Source file not found: ${sourcePath}`
    };
  }

  // Check if destination exists
  if (fs.existsSync(destPath)) {
    // Ask for confirmation
    const answer = await vscode.window.showWarningMessage(
      `File ${path.basename(destPath)} already exists. Overwrite?`,
      'Yes',
      'No'
    );

    if (answer !== 'Yes') {
      return { created: false, skipped: true };
    }
  }

  try {
    fs.copyFileSync(sourcePath, destPath);
    return { created: true, skipped: false };
  } catch (error: any) {
    return {
      created: false,
      skipped: false,
      error: `Failed to copy ${path.basename(sourcePath)}: ${error.message}`
    };
  }
}

/**
 * Registers the initialize command
 */
export function registerInitializeCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand('kiro.initializeSupport', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open. Please open a folder first.');
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    await initializeKiro(workspaceRoot);
  });

  context.subscriptions.push(command);
}
