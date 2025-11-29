import * as vscode from 'vscode';
import { LSPClientManager } from './lsp-client';

/**
 * Token types supported by VS Code
 */
export const TOKEN_TYPES = [
  'namespace',
  'class',
  'enum',
  'interface',
  'struct',
  'typeParameter',
  'type',
  'parameter',
  'variable',
  'property',
  'enumMember',
  'decorator',
  'event',
  'function',
  'method',
  'macro',
  'label',
  'comment',
  'string',
  'keyword',
  'number',
  'regexp',
  'operator'
];

/**
 * Token modifiers supported by VS Code
 */
export const TOKEN_MODIFIERS = [
  'declaration',
  'definition',
  'readonly',
  'static',
  'deprecated',
  'abstract',
  'async',
  'modification',
  'documentation',
  'defaultLibrary'
];

interface CachedTokens {
  tokens: vscode.SemanticTokens;
  timestamp: number;
}

export class SemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  private lspClient: LSPClientManager;
  private cache: Map<string, CachedTokens> = new Map();
  private cacheTTL: number = 5000; // 5 seconds

  constructor(lspClient: LSPClientManager) {
    this.lspClient = lspClient;
  }

  /**
   * Provides semantic tokens for a document
   */
  async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens | null> {
    // Check cache first
    const cached = this.getCachedTokens(document.uri.toString());
    if (cached) {
      return cached;
    }

    if (!this.lspClient.isRunning()) {
      return null;
    }

    try {
      const result = await this.lspClient.sendRequest<any>(
        'textDocument/semanticTokens/full',
        {
          textDocument: {
            uri: document.uri.toString()
          }
        }
      );

      if (!result || !result.data) {
        return null;
      }

      const tokens = new vscode.SemanticTokens(new Uint32Array(result.data));
      
      // Cache the result
      this.cacheTokens(document.uri.toString(), tokens);

      return tokens;
    } catch (error: any) {
      console.error('Error getting semantic tokens:', error);
      return null;
    }
  }

  /**
   * Gets cached tokens if they're still valid
   */
  private getCachedTokens(uri: string): vscode.SemanticTokens | null {
    const cached = this.cache.get(uri);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(uri);
      return null;
    }

    return cached.tokens;
  }

  /**
   * Caches tokens for a document
   */
  private cacheTokens(uri: string, tokens: vscode.SemanticTokens): void {
    this.cache.set(uri, {
      tokens,
      timestamp: Date.now()
    });
  }

  /**
   * Clears the cache for a specific document or all documents
   */
  clearCache(uri?: string): void {
    if (uri) {
      this.cache.delete(uri);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Sets the cache TTL
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }
}

/**
 * Creates the semantic tokens legend
 */
export function createSemanticTokensLegend(): vscode.SemanticTokensLegend {
  return new vscode.SemanticTokensLegend(TOKEN_TYPES, TOKEN_MODIFIERS);
}
