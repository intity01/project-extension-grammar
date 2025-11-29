/**
 * Incremental tokenization for performance optimization
 * Only re-tokenizes changed portions of the document
 */

import * as vscode from 'vscode';

export interface TokenInfo {
  text: string;
  scopes: string[];
  range: vscode.Range;
}

export interface TokenizationState {
  lineTokens: Map<number, TokenInfo[]>;
  lastVersion: number;
}

/**
 * Incremental tokenizer that caches tokenization results
 * and only re-tokenizes changed lines
 */
export class IncrementalTokenizer {
  private cache: Map<string, TokenizationState> = new Map();
  private readonly maxCacheSize = 100; // Maximum number of documents to cache

  /**
   * Tokenizes a document incrementally based on changes
   */
  tokenizeDocument(
    document: vscode.TextDocument,
    changes?: readonly vscode.TextDocumentContentChangeEvent[],
    tokenizeLine?: (line: string, lineNumber: number) => TokenInfo[]
  ): TokenInfo[] {
    const uri = document.uri.toString();
    let state = this.cache.get(uri);

    // Initialize state if not cached
    if (!state || state.lastVersion !== document.version) {
      state = {
        lineTokens: new Map(),
        lastVersion: document.version
      };
      this.cache.set(uri, state);
      
      // Manage cache size after adding new entry
      this.manageCacheSize();
    }

    // If no changes provided or no tokenizer, tokenize entire document
    if (!changes || changes.length === 0 || !tokenizeLine) {
      return this.tokenizeFullDocument(document, state, tokenizeLine);
    }

    // Incremental tokenization based on changes
    for (const change of changes) {
      const startLine = change.range.start.line;
      const endLine = change.range.end.line;
      const lineCountDelta = change.text.split('\n').length - 1 - (endLine - startLine);

      // Invalidate affected lines
      for (let i = startLine; i <= endLine; i++) {
        state.lineTokens.delete(i);
      }

      // Shift line numbers if lines were added or removed
      if (lineCountDelta !== 0) {
        const newLineTokens = new Map<number, TokenInfo[]>();
        for (const [lineNum, tokens] of state.lineTokens.entries()) {
          if (lineNum < startLine) {
            newLineTokens.set(lineNum, tokens);
          } else if (lineNum > endLine) {
            newLineTokens.set(lineNum + lineCountDelta, tokens);
          }
        }
        state.lineTokens = newLineTokens;
      }

      // Re-tokenize affected lines
      const newEndLine = startLine + change.text.split('\n').length - 1;
      for (let i = startLine; i <= newEndLine && i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const tokens = tokenizeLine(line.text, i);
        state.lineTokens.set(i, tokens);
      }
    }

    // Collect all tokens
    const allTokens: TokenInfo[] = [];
    for (let i = 0; i < document.lineCount; i++) {
      let tokens = state.lineTokens.get(i);
      if (!tokens && tokenizeLine) {
        const line = document.lineAt(i);
        tokens = tokenizeLine(line.text, i);
        state.lineTokens.set(i, tokens);
      }
      if (tokens) {
        allTokens.push(...tokens);
      }
    }

    // Update version
    state.lastVersion = document.version;

    return allTokens;
  }

  /**
   * Tokenizes the entire document
   */
  private tokenizeFullDocument(
    document: vscode.TextDocument,
    state: TokenizationState,
    tokenizeLine?: (line: string, lineNumber: number) => TokenInfo[]
  ): TokenInfo[] {
    const allTokens: TokenInfo[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      let tokens = state.lineTokens.get(i);

      if (!tokens && tokenizeLine) {
        tokens = tokenizeLine(line.text, i);
        state.lineTokens.set(i, tokens);
      }

      if (tokens) {
        allTokens.push(...tokens);
      }
    }

    state.lastVersion = document.version;
    return allTokens;
  }

  /**
   * Invalidates cache for a document
   */
  invalidateDocument(document: vscode.TextDocument): void {
    const uri = document.uri.toString();
    this.cache.delete(uri);
  }

  /**
   * Clears the entire cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }

  /**
   * Manages cache size by removing oldest entries
   */
  private manageCacheSize(): void {
    while (this.cache.size > this.maxCacheSize) {
      // Remove oldest entry (first entry in the map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      } else {
        break;
      }
    }
  }

  /**
   * Gets cached state for a document
   */
  getCachedState(document: vscode.TextDocument): TokenizationState | undefined {
    return this.cache.get(document.uri.toString());
  }
}

/**
 * Global incremental tokenizer instance
 */
export const globalIncrementalTokenizer = new IncrementalTokenizer();
