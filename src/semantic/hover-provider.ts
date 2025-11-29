import * as vscode from 'vscode';
import { LSPClientManager } from './lsp-client';

export class HoverProvider implements vscode.HoverProvider {
  private lspClient: LSPClientManager;

  constructor(lspClient: LSPClientManager) {
    this.lspClient = lspClient;
  }

  /**
   * Provides hover information for a position in a document
   */
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    if (!this.lspClient.isRunning()) {
      return null;
    }

    try {
      const result = await this.lspClient.sendRequest<any>(
        'textDocument/hover',
        {
          textDocument: {
            uri: document.uri.toString()
          },
          position: {
            line: position.line,
            character: position.character
          }
        }
      );

      if (!result || !result.contents) {
        return null;
      }

      // Convert LSP hover to VS Code hover
      const contents = this.convertContents(result.contents);
      const range = result.range ? this.convertRange(result.range) : undefined;

      return new vscode.Hover(contents, range);
    } catch (error: any) {
      console.error('Error getting hover information:', error);
      return null;
    }
  }

  /**
   * Converts LSP hover contents to VS Code markdown strings
   */
  private convertContents(contents: any): vscode.MarkdownString[] {
    if (typeof contents === 'string') {
      return [new vscode.MarkdownString(contents)];
    }

    if (Array.isArray(contents)) {
      return contents.map(item => {
        if (typeof item === 'string') {
          return new vscode.MarkdownString(item);
        }
        if (item.language && item.value) {
          const md = new vscode.MarkdownString();
          md.appendCodeblock(item.value, item.language);
          return md;
        }
        return new vscode.MarkdownString(item.value || '');
      });
    }

    if (contents.kind === 'markdown') {
      return [new vscode.MarkdownString(contents.value)];
    }

    if (contents.language && contents.value) {
      const md = new vscode.MarkdownString();
      md.appendCodeblock(contents.value, contents.language);
      return [md];
    }

    return [new vscode.MarkdownString(contents.value || '')];
  }

  /**
   * Converts LSP range to VS Code range
   */
  private convertRange(range: any): vscode.Range {
    return new vscode.Range(
      range.start.line,
      range.start.character,
      range.end.line,
      range.end.character
    );
  }
}
