// Mock vscode module for testing
export const window = {
  showErrorMessage: jest.fn(),
  showInformationMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createOutputChannel: jest.fn(() => ({
    appendLine: jest.fn(),
    show: jest.fn(),
    dispose: jest.fn()
  }))
};

export const workspace = {
  getConfiguration: jest.fn((section?: string) => ({
    get: jest.fn((key: string, defaultValue?: any) => {
      // Return default values for configuration
      if (section === 'projectExtensionGrammar') {
        if (key === 'lsp.enabled') return true;
        if (key === 'lsp.serverPath') return '';
        if (key === 'steering.autoLoad') return true;
        if (key === 'hooks.enabled') return true;
        if (key === 'mcp.enabled') return true;
      }
      return defaultValue;
    }),
    update: jest.fn()
  })),
  onDidChangeConfiguration: jest.fn((callback) => ({
    dispose: jest.fn()
  })),
  onDidOpenTextDocument: jest.fn((callback) => ({
    dispose: jest.fn()
  })),
  createFileSystemWatcher: jest.fn(() => ({
    onDidCreate: jest.fn(),
    onDidChange: jest.fn(),
    onDidDelete: jest.fn(),
    dispose: jest.fn()
  })),
  workspaceFolders: []
};

export class Uri {
  public fsPath: string;

  static parse(value: string): Uri {
    return new Uri(value);
  }

  static file(path: string): Uri {
    const uri = new Uri(`file://${path}`);
    uri.fsPath = path;
    return uri;
  }

  constructor(public value: string) {
    this.fsPath = value.replace(/^file:\/\//, '');
  }

  toString(): string {
    return this.value;
  }
}

export class Range {
  constructor(
    public startLine: number,
    public startCharacter: number,
    public endLine: number,
    public endCharacter: number
  ) {}
}

export class Position {
  constructor(
    public line: number,
    public character: number
  ) {}
}

export class Location {
  constructor(
    public uri: Uri,
    public range: Range
  ) {}
}

export class MarkdownString {
  value: string = '';

  constructor(value?: string) {
    if (value) {
      this.value = value;
    }
  }

  appendCodeblock(value: string, language?: string): void {
    this.value += `\`\`\`${language || ''}\n${value}\n\`\`\`\n`;
  }

  appendMarkdown(value: string): void {
    this.value += value;
  }
}

export class Hover {
  constructor(
    public contents: MarkdownString[],
    public range?: Range
  ) {}
}

export class SemanticTokens {
  constructor(public data: Uint32Array) {}
}

export class SemanticTokensLegend {
  constructor(
    public tokenTypes: string[],
    public tokenModifiers: string[]
  ) {}
}

export class RelativePattern {
  constructor(
    public base: string,
    public pattern: string
  ) {}
}

export enum ExtensionMode {
  Production = 1,
  Development = 2,
  Test = 3
}

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn()
};

export const languages = {
  registerHoverProvider: jest.fn(),
  registerDefinitionProvider: jest.fn(),
  registerReferenceProvider: jest.fn(),
  registerDocumentSemanticTokensProvider: jest.fn()
};
