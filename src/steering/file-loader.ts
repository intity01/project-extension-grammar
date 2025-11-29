import * as vscode from 'vscode';
import * as fs from 'fs';
import matter from 'gray-matter';
import { minimatch } from 'minimatch';
import { SteeringFile, SteeringFileFrontmatter, FileContext } from './steering-manager';

/**
 * Loads a steering file from disk and parses its frontmatter
 */
export function loadSteeringFile(filePath: string): SteeringFile {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(content);

  return {
    path: filePath,
    content: parsed.content,
    frontmatter: {
      inclusion: parsed.data.inclusion || 'always',
      fileMatchPattern: parsed.data.fileMatchPattern,
      priority: parsed.data.priority || 0
    }
  };
}

/**
 * Determines if a steering file should be loaded based on its inclusion type and context
 */
export function shouldLoadFile(file: SteeringFile, context: FileContext): boolean {
  const { inclusion, fileMatchPattern } = file.frontmatter;

  switch (inclusion) {
    case 'always':
      return true;

    case 'fileMatch':
      if (!fileMatchPattern || !context.document) {
        return false;
      }
      return matchesFilePattern(context.document.uri.fsPath, fileMatchPattern);

    case 'manual':
      return false;

    default:
      console.warn(`Unknown inclusion type: ${inclusion}`);
      return false;
  }
}

/**
 * Checks if a file path matches a glob pattern
 */
export function matchesFilePattern(filePath: string, pattern: string): boolean {
  try {
    // Normalize path separators for cross-platform compatibility
    const normalizedPath = filePath.replace(/\\/g, '/');
    return minimatch(normalizedPath, pattern, { matchBase: true });
  } catch (error) {
    console.error(`Invalid pattern: ${pattern}`, error);
    return false;
  }
}

/**
 * Validates a file match pattern
 */
export function isValidPattern(pattern: string): boolean {
  try {
    // Test the pattern with a dummy path
    minimatch('/test/path.txt', pattern);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sorts steering files by priority (higher priority first)
 */
export function sortByPriority(files: SteeringFile[]): SteeringFile[] {
  return files.sort((a, b) => {
    const priorityA = a.frontmatter.priority || 0;
    const priorityB = b.frontmatter.priority || 0;
    return priorityB - priorityA;
  });
}
