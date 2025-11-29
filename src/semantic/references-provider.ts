import * as vscode from 'vscode';
import { LSPClientManager } from './lsp-client';

export class ReferencesProvider implements vscode.ReferenceProvider {
  private lspClient: LSPClientManager;

  constructor(lspClient: LSPClientManager) {
    this.lspClient = lspClient;
  }

  /**
   * Provides reference locations for a symbol at a position
   */
  async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.ReferenceContext,
    token: vscode.CancellationToken
  ): Promise<vscode.Location[] | null> {
    if (!this.lspClient.isRunning()) {
      return null;
    }

    try {
      const result = await this.lspClient.sendRequest<any[]>(
        'textDocument/references',
        {
          textDocument: {
            uri: document.uri.toString()
          },
          position: {
            line: position.line,
            character: position.character
          },
          context: {
            includeDeclaration: context.includeDeclaration
          }
        }
      );

      if (!result || !Array.isArray(result)) {
        return null;
      }

      return result.map(loc => this.convertLocation(loc));
    } catch (error: any) {
      console.error('Error getting references:', error);
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
