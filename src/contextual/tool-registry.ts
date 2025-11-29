export interface ToolInfo {
  name: string;
  description: string;
  inputSchema: any;
}

export class ToolRegistry {
  private tools: Map<string, ToolInfo> = new Map();

  /**
   * Registers a tool
   */
  registerTool(tool: ToolInfo): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Gets a tool by name
   */
  getTool(name: string): ToolInfo | undefined {
    return this.tools.get(name);
  }

  /**
   * Lists all registered tools
   */
  listTools(): ToolInfo[] {
    return Array.from(this.tools.values());
  }

  /**
   * Checks if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Unregisters a tool
   */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Clears all tools
   */
  clear(): void {
    this.tools.clear();
  }
}
