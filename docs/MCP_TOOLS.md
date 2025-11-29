# MCP Tools Documentation

This document describes the Model Context Protocol (MCP) server integration and available tools for the Project Extension Grammar extension.

## Table of Contents

- [Overview](#overview)
- [Server Architecture](#server-architecture)
- [Available Tools](#available-tools)
- [Creating Custom Tools](#creating-custom-tools)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Overview

The MCP server provides dynamic data access to the AI Agent, enabling it to fetch documentation, analyze dependencies, and perform other context-aware operations that go beyond static steering files.

### What is MCP?

Model Context Protocol (MCP) is a standardized protocol for connecting AI models to external data sources and tools. It enables:

- **Dynamic Data Access**: Fetch information at runtime rather than embedding it statically
- **Tool Execution**: Perform operations like file analysis, API calls, or code generation
- **Extensibility**: Add custom tools specific to your language or framework

### Benefits

- **Up-to-date Information**: Always fetch the latest documentation or data
- **Reduced Context Size**: Don't embed large documentation in steering files
- **Interactive Capabilities**: Enable AI to perform actions, not just read context
- **Language-Specific Features**: Provide tools tailored to your language ecosystem

## Server Architecture

### Server Location

The MCP server is bundled with the extension in the `server/` directory:

```
server/
├── src/
│   ├── index.ts           # Server entry point
│   ├── tools/             # Tool implementations
│   │   ├── fetch-docs.ts
│   │   ├── analyze-deps.ts
│   │   └── scaffold-module.ts
│   └── utils/
│       └── parser.ts
├── package.json
└── tsconfig.json
```

### Communication

- **Transport**: stdio (standard input/output)
- **Protocol**: JSON-RPC 2.0
- **Lifecycle**: Managed by extension, auto-starts on activation

### Health Monitoring

The extension performs health checks every 30 seconds:
- Monitors server process status
- Auto-restarts on crash (max 3 retries)
- Reports errors to user if restart fails

## Available Tools

### Tool 1: fetch_standard_lib_docs

**Purpose**: Fetch documentation for standard library functions or built-in language features.

**Input Schema**:
```typescript
{
  type: 'object',
  properties: {
    symbol: {
      type: 'string',
      description: 'The function or class name to look up'
    },
    module: {
      type: 'string',
      description: 'Optional module or package name'
    }
  },
  required: ['symbol']
}
```

**Example Usage**:
```typescript
// AI Agent calls:
await mcpClient.callTool('fetch_standard_lib_docs', {
  symbol: 'Array.map',
  module: 'JavaScript'
});

// Returns:
{
  symbol: 'Array.map',
  description: 'Creates a new array with the results of calling a function on every element',
  signature: 'map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[]',
  examples: [
    'const numbers = [1, 2, 3];\nconst doubled = numbers.map(x => x * 2);'
  ],
  url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map'
}
```

**Implementation**:
```typescript
// server/src/tools/fetch-docs.ts
export async function fetchStandardLibDocs(params: {
  symbol: string;
  module?: string;
}): Promise<DocResult> {
  // 1. Check local cache
  const cached = await cache.get(params.symbol);
  if (cached) return cached;
  
  // 2. Fetch from official documentation
  const docs = await fetchFromOfficialDocs(params);
  
  // 3. Parse and format
  const formatted = formatDocumentation(docs);
  
  // 4. Cache result
  await cache.set(params.symbol, formatted);
  
  return formatted;
}
```

---

### Tool 2: analyze_dependencies

**Purpose**: Analyze project dependencies and provide version information, security advisories, and update recommendations.

**Input Schema**:
```typescript
{
  type: 'object',
  properties: {
    manifestPath: {
      type: 'string',
      description: 'Path to package.json, requirements.txt, or similar'
    },
    checkUpdates: {
      type: 'boolean',
      description: 'Whether to check for available updates',
      default: false
    }
  },
  required: ['manifestPath']
}
```

**Example Usage**:
```typescript
// AI Agent calls:
await mcpClient.callTool('analyze_dependencies', {
  manifestPath: 'package.json',
  checkUpdates: true
});

// Returns:
{
  dependencies: [
    {
      name: 'express',
      version: '4.18.0',
      latest: '4.18.2',
      updateAvailable: true,
      securityIssues: 0
    },
    {
      name: 'lodash',
      version: '4.17.20',
      latest: '4.17.21',
      updateAvailable: true,
      securityIssues: 1,
      advisory: 'CVE-2021-23337: Command injection vulnerability'
    }
  ],
  summary: {
    total: 45,
    outdated: 12,
    vulnerable: 1
  }
}
```

**Implementation**:
```typescript
// server/src/tools/analyze-deps.ts
export async function analyzeDependencies(params: {
  manifestPath: string;
  checkUpdates?: boolean;
}): Promise<DependencyAnalysis> {
  // 1. Read manifest file
  const manifest = await readManifest(params.manifestPath);
  
  // 2. Parse dependencies
  const deps = parseDependencies(manifest);
  
  // 3. Check for updates (if requested)
  if (params.checkUpdates) {
    await checkForUpdates(deps);
  }
  
  // 4. Check security advisories
  await checkSecurityAdvisories(deps);
  
  // 5. Generate summary
  return generateSummary(deps);
}
```

---

### Tool 3: scaffold_module

**Purpose**: Generate boilerplate code for new modules following project conventions.

**Input Schema**:
```typescript
{
  type: 'object',
  properties: {
    moduleType: {
      type: 'string',
      enum: ['service', 'component', 'repository', 'controller'],
      description: 'Type of module to scaffold'
    },
    name: {
      type: 'string',
      description: 'Name of the module'
    },
    options: {
      type: 'object',
      description: 'Additional options specific to module type'
    }
  },
  required: ['moduleType', 'name']
}
```

**Example Usage**:
```typescript
// AI Agent calls:
await mcpClient.callTool('scaffold_module', {
  moduleType: 'service',
  name: 'UserService',
  options: {
    includeTests: true,
    includeInterface: true
  }
});

// Returns:
{
  files: [
    {
      path: 'src/services/user.service.ts',
      content: '...'
    },
    {
      path: 'src/services/user.service.interface.ts',
      content: '...'
    },
    {
      path: 'src/services/user.service.test.ts',
      content: '...'
    }
  ],
  instructions: 'Created UserService with interface and tests. Next steps: implement business logic.'
}
```

**Implementation**:
```typescript
// server/src/tools/scaffold-module.ts
export async function scaffoldModule(params: {
  moduleType: string;
  name: string;
  options?: Record<string, any>;
}): Promise<ScaffoldResult> {
  // 1. Load template for module type
  const template = await loadTemplate(params.moduleType);
  
  // 2. Apply name and options
  const files = generateFiles(template, params);
  
  // 3. Validate against project structure
  validateStructure(files);
  
  // 4. Return file contents
  return {
    files,
    instructions: generateInstructions(params)
  };
}
```

---

## Creating Custom Tools

### Step 1: Define Tool Interface

Create a new file in `server/src/tools/`:

```typescript
// server/src/tools/my-custom-tool.ts
import { Tool } from '@modelcontextprotocol/sdk';

export interface MyToolParams {
  param1: string;
  param2?: number;
}

export interface MyToolResult {
  data: string;
  metadata: Record<string, any>;
}

export const myCustomTool: Tool<MyToolParams, MyToolResult> = {
  name: 'my_custom_tool',
  description: 'Description of what this tool does',
  
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description of param1'
      },
      param2: {
        type: 'number',
        description: 'Optional parameter',
        default: 0
      }
    },
    required: ['param1']
  },
  
  async execute(params: MyToolParams): Promise<MyToolResult> {
    // Implementation
    const result = await performOperation(params);
    
    return {
      data: result,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
  }
};
```

### Step 2: Register Tool

Add the tool to the server in `server/src/index.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { myCustomTool } from './tools/my-custom-tool.js';

const server = new Server(
  {
    name: 'project-extension-grammar-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: myCustomTool.name,
      description: myCustomTool.description,
      inputSchema: myCustomTool.inputSchema,
    },
  ],
}));

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === myCustomTool.name) {
    return await myCustomTool.execute(request.params.arguments);
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Step 3: Test Tool

Create tests in `server/src/tools/my-custom-tool.test.ts`:

```typescript
import { myCustomTool } from './my-custom-tool';

describe('myCustomTool', () => {
  it('should execute successfully with valid params', async () => {
    const result = await myCustomTool.execute({
      param1: 'test',
      param2: 42
    });
    
    expect(result.data).toBeDefined();
    expect(result.metadata.timestamp).toBeDefined();
  });
  
  it('should handle missing optional params', async () => {
    const result = await myCustomTool.execute({
      param1: 'test'
    });
    
    expect(result).toBeDefined();
  });
});
```

### Step 4: Document Tool

Add documentation to this file and to README.md.

## Configuration

### Server Configuration

The MCP server is configured in the extension's activation:

```typescript
// src/contextual/mcp-manager.ts
export class MCPManager {
  async registerServer(): Promise<void> {
    const serverConfig = {
      name: 'language-tools',
      command: 'node',
      args: [
        path.join(this.extensionPath, 'server', 'build', 'index.js')
      ],
      env: {
        LOG_LEVEL: this.getLogLevel(),
        NODE_ENV: 'production'
      }
    };
    
    await this.mcpClient.registerServer(serverConfig);
  }
}
```

### Environment Variables

Configure server behavior through environment variables:

- **`LOG_LEVEL`**: `"debug" | "info" | "warn" | "error"`
  - Controls logging verbosity
  - Default: `"info"`

- **`NODE_ENV`**: `"development" | "production"`
  - Affects error reporting and performance optimizations
  - Default: `"production"`

- **`CACHE_TTL`**: Number (seconds)
  - Time-to-live for cached results
  - Default: `3600` (1 hour)

### User Settings

Users can configure MCP through VS Code settings:

```json
{
  "projectExtensionGrammar.mcp.enabled": true,
  "projectExtensionGrammar.mcp.logLevel": "info",
  "projectExtensionGrammar.mcp.timeout": 2000
}
```

## Tool Development Best Practices

### 1. Input Validation

Always validate input parameters:

```typescript
export async function myTool(params: MyParams): Promise<MyResult> {
  // Validate required params
  if (!params.required) {
    throw new Error('Missing required parameter: required');
  }
  
  // Validate param format
  if (!/^[a-z]+$/.test(params.name)) {
    throw new Error('Invalid name format: must be lowercase letters');
  }
  
  // Proceed with execution
  // ...
}
```

### 2. Error Handling

Provide meaningful error messages:

```typescript
try {
  const result = await fetchData(params);
  return result;
} catch (error) {
  if (error.code === 'ENOENT') {
    throw new Error(`File not found: ${params.path}`);
  } else if (error.code === 'EACCES') {
    throw new Error(`Permission denied: ${params.path}`);
  } else {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}
```

### 3. Caching

Implement caching for expensive operations:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

export async function cachedTool(params: Params): Promise<Result> {
  const cacheKey = JSON.stringify(params);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const result = await expensiveOperation(params);
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  return result;
}
```

### 4. Timeouts

Set reasonable timeouts for operations:

```typescript
export async function toolWithTimeout(params: Params): Promise<Result> {
  const timeout = params.timeout || 2000; // 2 seconds default
  
  const result = await Promise.race([
    performOperation(params),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeout)
    )
  ]);
  
  return result as Result;
}
```

### 5. Logging

Log important events for debugging:

```typescript
import { logger } from '../utils/logger';

export async function myTool(params: Params): Promise<Result> {
  logger.info('Tool execution started', { tool: 'myTool', params });
  
  try {
    const result = await execute(params);
    logger.info('Tool execution completed', { tool: 'myTool', success: true });
    return result;
  } catch (error) {
    logger.error('Tool execution failed', { tool: 'myTool', error });
    throw error;
  }
}
```

## Troubleshooting

### Server Not Starting

**Symptoms**: Extension activates but MCP tools are unavailable

**Solutions**:
1. Check server build: `cd server && npm run build`
2. Verify Node.js version: `node --version` (should be 18+)
3. Check extension logs: Output → Project Extension Grammar
4. Verify `projectExtensionGrammar.mcp.enabled` is `true`

### Tool Execution Timeout

**Symptoms**: Tool calls fail with timeout error

**Solutions**:
1. Increase timeout in settings
2. Optimize tool implementation
3. Add caching for expensive operations
4. Check network connectivity (if tool fetches external data)

### Tool Returns Incorrect Data

**Symptoms**: Tool executes but returns unexpected results

**Solutions**:
1. Check input parameters are correct
2. Verify tool implementation logic
3. Check external data sources
4. Review tool tests
5. Enable debug logging: `LOG_LEVEL=debug`

### Server Crashes

**Symptoms**: Server process terminates unexpectedly

**Solutions**:
1. Check server logs for error messages
2. Verify all dependencies are installed
3. Check for unhandled promise rejections
4. Review recent code changes
5. Test tool in isolation

## Performance Considerations

### Response Time Targets

- **Simple queries**: < 100ms
- **Documentation fetches**: < 500ms
- **Dependency analysis**: < 1s
- **Code generation**: < 2s

### Optimization Strategies

1. **Caching**: Cache frequently accessed data
2. **Lazy Loading**: Load data only when needed
3. **Parallel Execution**: Run independent operations concurrently
4. **Streaming**: Stream large results instead of buffering
5. **Indexing**: Pre-index searchable data

## Security Considerations

### Input Sanitization

Always sanitize user input:

```typescript
function sanitizePath(path: string): string {
  // Prevent directory traversal
  const normalized = path.normalize(path);
  if (normalized.includes('..')) {
    throw new Error('Invalid path: directory traversal not allowed');
  }
  return normalized;
}
```

### File System Access

Restrict file system access:

```typescript
const ALLOWED_DIRECTORIES = [
  workspaceRoot,
  path.join(workspaceRoot, 'src'),
  path.join(workspaceRoot, 'test')
];

function validatePath(filePath: string): void {
  const absolute = path.resolve(filePath);
  const allowed = ALLOWED_DIRECTORIES.some(dir => 
    absolute.startsWith(dir)
  );
  
  if (!allowed) {
    throw new Error('Access denied: path outside allowed directories');
  }
}
```

### API Keys

Never expose API keys in tool responses:

```typescript
function sanitizeResponse(data: any): any {
  // Remove sensitive fields
  const sanitized = { ...data };
  delete sanitized.apiKey;
  delete sanitized.secret;
  delete sanitized.token;
  return sanitized;
}
```

## Additional Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [Extension Development Guide](./DEVELOPMENT.md)
- [Configuration Guide](./CONFIGURATION.md)
