// Mock vscode-languageclient module for testing

export class LanguageClient {
  constructor(
    public id: string,
    public name: string,
    public serverOptions: any,
    public clientOptions: any
  ) {}

  start(): Promise<void> {
    return Promise.resolve();
  }

  stop(): Promise<void> {
    return Promise.resolve();
  }

  sendRequest(method: string, params?: any): Promise<any> {
    return Promise.resolve(null);
  }

  onReady(): Promise<void> {
    return Promise.resolve();
  }

  dispose(): void {}
}

export enum TransportKind {
  stdio = 0,
  ipc = 1,
  pipe = 2,
  socket = 3
}

export interface ServerOptions {
  run: Executable;
  debug: Executable;
}

export interface Executable {
  command: string;
  args?: string[];
  options?: ExecutableOptions;
}

export interface ExecutableOptions {
  cwd?: string;
  env?: any;
}

export interface LanguageClientOptions {
  documentSelector?: any;
  synchronize?: any;
  initializationOptions?: any;
}
