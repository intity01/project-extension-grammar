import { ToolRegistry, ToolInfo } from '../../src/contextual/tool-registry';
import { MCPServerConfig, ServerStatus } from '../../src/contextual/mcp-manager';

describe('MCP Integration', () => {
  describe('ToolRegistry', () => {
    let registry: ToolRegistry;

    beforeEach(() => {
      registry = new ToolRegistry();
    });

    it('should register a tool', () => {
      const tool: ToolInfo = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' }
      };

      registry.registerTool(tool);

      expect(registry.hasTool('test-tool')).toBe(true);
    });

    it('should get a registered tool', () => {
      const tool: ToolInfo = {
        name: 'fetch-docs',
        description: 'Fetches documentation',
        inputSchema: { type: 'object' }
      };

      registry.registerTool(tool);

      const retrieved = registry.getTool('fetch-docs');
      expect(retrieved).toEqual(tool);
    });

    it('should list all tools', () => {
      const tool1: ToolInfo = {
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: {}
      };

      const tool2: ToolInfo = {
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: {}
      };

      registry.registerTool(tool1);
      registry.registerTool(tool2);

      const tools = registry.listTools();
      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.name)).toContain('tool1');
      expect(tools.map(t => t.name)).toContain('tool2');
    });

    it('should unregister a tool', () => {
      const tool: ToolInfo = {
        name: 'temp-tool',
        description: 'Temporary tool',
        inputSchema: {}
      };

      registry.registerTool(tool);
      expect(registry.hasTool('temp-tool')).toBe(true);

      registry.unregisterTool('temp-tool');
      expect(registry.hasTool('temp-tool')).toBe(false);
    });

    it('should clear all tools', () => {
      registry.registerTool({
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: {}
      });

      registry.registerTool({
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: {}
      });

      expect(registry.listTools()).toHaveLength(2);

      registry.clear();
      expect(registry.listTools()).toHaveLength(0);
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.getTool('non-existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('MCPServerConfig', () => {
    it('should define server configuration structure', () => {
      const config: MCPServerConfig = {
        command: 'node',
        args: ['server.js'],
        env: { LOG_LEVEL: 'info' },
        disabled: false,
        autoApprove: ['tool1', 'tool2']
      };

      expect(config.command).toBe('node');
      expect(config.args).toEqual(['server.js']);
      expect(config.env).toEqual({ LOG_LEVEL: 'info' });
      expect(config.disabled).toBe(false);
      expect(config.autoApprove).toEqual(['tool1', 'tool2']);
    });

    it('should allow optional fields', () => {
      const config: MCPServerConfig = {
        command: 'python',
        args: ['server.py']
      };

      expect(config.command).toBe('python');
      expect(config.args).toEqual(['server.py']);
      expect(config.env).toBeUndefined();
      expect(config.disabled).toBeUndefined();
      expect(config.autoApprove).toBeUndefined();
    });
  });

  describe('ServerStatus', () => {
    it('should track server status', () => {
      const status: ServerStatus = {
        running: true,
        lastHealthCheck: new Date(),
        restartCount: 0
      };

      expect(status.running).toBe(true);
      expect(status.lastHealthCheck).toBeInstanceOf(Date);
      expect(status.restartCount).toBe(0);
    });

    it('should track restart count', () => {
      const status: ServerStatus = {
        running: false,
        restartCount: 3
      };

      expect(status.running).toBe(false);
      expect(status.restartCount).toBe(3);
    });
  });
});
