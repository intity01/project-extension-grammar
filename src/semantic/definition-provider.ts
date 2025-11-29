import * as vscode from 'vscode';
import { LSPClientManager } from './lsp-client';

export class DefinitionProvider implements vscode.DefinitionProvider {
  private lspClient: LSPClientManager;

  constructor(lspClient: LSPClientManager) {
    this.lspClient = lspClient;
  }

  /**
   * Provides definition locations for a symbol at a position
   */
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Definition | null> {
    if (!this.lspClient.isRunning()) {
      return null;
    }

    try {
      const result = await this.lspClient.sendRequest<any>(
        'textDocument/definition',
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

      if (!result) {
        return null;
      }

      // Handle single location
      if (!Array.isArray(result)) {
        return this.convertLocation(result);
      }

      // Handle array of locations
      return result.map(loc => this.convertLocation(loc));
    } catch (error: any) {
      console.error('Error getting definition:', error);
      return null;
    }
  }

  /**
   * Converts LSP location to VS Code location
   */
  private convertLocation(location: any): vscode.Location {
    const uri = vscode.Uri.parse(location.uri);
    const range = new vscode.Range(
      location.range.start.line,
      location.range.start.character,
      location.range.end.line,
      location.range.end.character
    );
    return new vscode.Location(uri, range);
  }
}
