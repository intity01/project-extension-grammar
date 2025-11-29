# Configuration Guide

This guide provides detailed information about all configuration options available in the Project Extension Grammar extension.

## Table of Contents

- [Extension Settings](#extension-settings)
- [Steering Files](#steering-files)
- [Hook Configuration](#hook-configuration)
- [MCP Server Configuration](#mcp-server-configuration)
- [Language Configuration](#language-configuration)
- [JSON Schemas](#json-schemas)

## Extension Settings

All extension settings are accessible through VS Code/Kiro IDE settings (File → Preferences → Settings or `Ctrl+,`).

### LSP Settings

#### `projectExtensionGrammar.lsp.enabled`

**Type**: `boolean`  
**Default**: `true`

Enable or disable Language Server Protocol integration for semantic analysis.

When enabled, the extension will:
- Start the language server process
- Provide semantic highlighting
- Enable go-to-definition, find references, and hover information
- Offer code intelligence features

**Example**:
```json
{
  "projectExtensionGrammar.lsp.enabled": true
}
```

**When to disable**: If you're experiencing performance issues or conflicts with another language server.

---

#### `projectExtensionGrammar.lsp.serverPath`

**Type**: `string`  
**Default**: `""` (empty string)

Path to a custom language server executable.

When empty, the extension uses the bundled language server. Specify a custom path if you want to use a different language server implementation or version.

**Example**:
```json
{
  "projectExtensionGrammar.lsp.serverPath": "/usr/local/bin/custom-language-server"
}
```

**Path formats**:
- Absolute path: `/usr/local/bin/server`
- Relative to workspace: `${workspaceFolder}/tools/server`
- Relative to home: `~/bin/server`

---

### Steering Settings

#### `projectExtensionGrammar.steering.autoLoad`

**Type**: `boolean`  
**Default**: `true`

Automatically load steering files when opening files that match their patterns.

When enabled:
- Files with `inclusion: always` are loaded immediately
- Files with `inclusion: fileMatch` are loaded when matching files are opened
- Files with `inclusion: manual` are never auto-loaded

**Example**:
```json
{
  "projectExtensionGrammar.steering.autoLoad": true
}
```

**When to disable**: If you want full manual control over which steering files are active, or if auto-loading causes performance issues.

---

### Hooks Settings

#### `projectExtensionGrammar.hooks.enabled`

**Type**: `boolean`  
**Default**: `true`

Enable or disable agent hooks for automated workflows.

When enabled, hooks will trigger based on their configured events (onSave, onFileCreate, etc.).

**Example**:
```json
{
  "projectExtensionGrammar.hooks.enabled": true
}
```

**When to disable**: During debugging, when you want to prevent automated actions, or if hooks are causing issues.

---

### MCP Settings

#### `projectExtensionGrammar.mcp.enabled`

**Type**: `boolean`  
**Default**: `true`

Enable or disable Model Context Protocol server integration.

When enabled, the MCP server will start automatically and provide tools to the AI Agent.

**Example**:
```json
{
  "projectExtensionGrammar.mcp.enabled": true
}
```

**When to disable**: If you don't need MCP tools or want to reduce resource usage.

---

## Steering Files

Steering files are Markdown documents with YAML frontmatter that provide context and rules to the AI Agent.

### File Location

Steering files should be placed in:
- **Project-level**: `.kiro/steering/` (higher priority)
- **Global-level**: `~/.kiro/steering/` (lower priority)

### Frontmatter Schema

```yaml
---
inclusion: always | fileMatch | manual
fileMatchPattern: "glob pattern"  # Required if inclusion is fileMatch
priority: number                   # Optional, default: 0
---
```

#### `inclusion` (required)

**Type**: `"always" | "fileMatch" | "manual"`

Determines when the steering file is loaded:

- **`always`**: Loaded in all contexts
  - Use for: Project-wide rules, coding standards, general guidelines
  - Example: Naming conventions, error handling patterns

- **`fileMatch`**: Loaded only when active file matches `fileMatchPattern`
  - Use for: Language-specific rules, framework guidelines
  - Example: React component rules, Python style guide
  - Requires: `fileMatchPattern` field

- **`manual`**: Never auto-loaded, only when explicitly referenced
  - Use for: Optional context, specialized knowledge
  - Example: Advanced patterns, migration guides
  - Reference with: `#steering-file-name` in chat

**Examples**:

```yaml
# Always loaded
---
inclusion: always
---
```

```yaml
# Loaded for TypeScript files
---
inclusion: fileMatch
fileMatchPattern: "**/*.ts"
---
```

```yaml
# Manual loading only
---
inclusion: manual
---
```

---

#### `fileMatchPattern` (conditional)

**Type**: `string` (glob pattern)  
**Required when**: `inclusion: fileMatch`

Glob pattern to match file paths. Uses [minimatch](https://github.com/isaacs/minimatch) syntax.

**Pattern syntax**:
- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/`
- `?` - Matches single character
- `[abc]` - Matches any character in set
- `{a,b}` - Matches any of the alternatives

**Examples**:

```yaml
# Match all TypeScript files
fileMatchPattern: "**/*.ts"

# Match test files only
fileMatchPattern: "**/*.test.ts"

# Match files in src directory
fileMatchPattern: "src/**/*.ts"

# Match multiple extensions
fileMatchPattern: "**/*.{ts,tsx}"

# Match specific directory
fileMatchPattern: "components/**/*"
```

---

#### `priority` (optional)

**Type**: `number`  
**Default**: `0`

Controls loading order when multiple steering files match. Higher numbers load first.

**Use cases**:
- Ensure general rules load before specific ones
- Override default behavior with higher priority
- Control context window usage

**Examples**:

```yaml
# High priority - loads first
---
inclusion: always
priority: 10
---

# Medium priority
---
inclusion: fileMatch
fileMatchPattern: "**/*.ts"
priority: 5
---

# Low priority - loads last
---
inclusion: always
priority: 1
---
```

---

### Complete Steering File Examples

#### Example 1: Project-Wide Coding Standards

```markdown
---
inclusion: always
priority: 10
---

# Coding Standards

## Naming Conventions

- **Variables and Functions**: camelCase
  - `getUserData()`, `isValid`, `totalCount`
  
- **Classes and Interfaces**: PascalCase
  - `UserManager`, `IDataProvider`, `HttpClient`
  
- **Constants**: UPPER_SNAKE_CASE
  - `MAX_RETRIES`, `API_BASE_URL`, `DEFAULT_TIMEOUT`

## File Organization

- One class per file
- File name matches class name
- Group related functions together
- Keep files under 300 lines

## Error Handling

- Always use try-catch for async operations
- Provide meaningful error messages
- Log errors with appropriate severity
- Never swallow errors silently

## Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up-to-date
- Remove commented-out code
```

---

#### Example 2: Framework-Specific Rules

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.component.ts"
priority: 5
---

# Angular Component Guidelines

## Component Structure

Components should follow this order:
1. Decorators
2. Properties
3. Constructor
4. Lifecycle hooks (in order)
5. Public methods
6. Private methods

## Best Practices

- Keep components under 200 lines
- Use OnPush change detection when possible
- Implement OnDestroy for cleanup
- Avoid logic in templates
- Use async pipe for observables

## Example

\`\`\`typescript
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy {
  users$: Observable<User[]>;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.users$ = this.userService.getUsers();
  }
  
  ngOnDestroy(): void {
    // Cleanup
  }
}
\`\`\`
```

---

#### Example 3: Architecture Documentation

```markdown
---
inclusion: always
priority: 8
---

# Project Architecture

## Directory Structure

\`\`\`
src/
├── app/
│   ├── core/           # Singleton services, guards
│   ├── shared/         # Shared components, pipes, directives
│   ├── features/       # Feature modules
│   └── models/         # Data models and interfaces
├── assets/             # Static files
└── environments/       # Environment configs
\`\`\`

## Module Organization

- **Core Module**: Import once in AppModule
  - Authentication service
  - HTTP interceptors
  - Global error handler

- **Shared Module**: Import in feature modules
  - Common components
  - Pipes and directives
  - Utility functions

- **Feature Modules**: Lazy-loaded
  - Self-contained features
  - Own routing
  - Feature-specific services

## File Placement Rules

- **Services**: Place in the module that uses them
- **Models**: Place in `models/` if shared, otherwise in feature
- **Components**: Place in feature directory
- **Guards**: Place in `core/guards/`
- **Interceptors**: Place in `core/interceptors/`
```

---

## Hook Configuration

Hooks are defined in JSON files located in `.kiro/hooks/`.

### Hook Schema

```typescript
interface Hook {
  name: string;
  trigger: {
    type: 'onSave' | 'onFileCreate' | 'onPreCommit' | 'manual';
    filePattern?: string;
  };
  action: {
    type: 'prompt' | 'command';
    prompt?: string;
    command?: string;
  };
  enabled: boolean;
  preventRecursion: boolean;
}
```

### Fields

#### `name` (required)

**Type**: `string`

Human-readable name for the hook. Displayed in logs and UI.

**Example**: `"Auto Test on Save"`, `"Pre-Commit Validation"`

---

#### `trigger` (required)

**Type**: `object`

Defines when the hook executes.

##### `trigger.type` (required)

**Type**: `"onSave" | "onFileCreate" | "onPreCommit" | "manual"`

- **`onSave`**: Executes when a file is saved
- **`onFileCreate`**: Executes when a new file is created
- **`onPreCommit`**: Executes before a git commit
- **`manual`**: Executes only when manually triggered

##### `trigger.filePattern` (optional)

**Type**: `string` (glob pattern)

File pattern to match. If omitted, triggers for all files.

**Examples**:
- `"**/*.test.ts"` - Test files only
- `"src/**/*.ts"` - TypeScript files in src
- `"**/*.{ts,tsx}"` - TypeScript and TSX files

---

#### `action` (required)

**Type**: `object`

Defines what the hook does when triggered.

##### `action.type` (required)

**Type**: `"prompt" | "command"`

- **`prompt`**: Sends a prompt to the AI Agent
- **`command`**: Executes a shell command

##### `action.prompt` (conditional)

**Type**: `string`  
**Required when**: `action.type === "prompt"`

The prompt to send to the AI Agent.

**Example**: `"Run tests for this file and report results"`

##### `action.command` (conditional)

**Type**: `string`  
**Required when**: `action.type === "command"`

The shell command to execute.

**Example**: `"npm test -- ${file}"`

**Variables**:
- `${file}` - Current file path
- `${workspace}` - Workspace root path
- `${fileName}` - File name without path

---

#### `enabled` (required)

**Type**: `boolean`

Whether the hook is active. Set to `false` to temporarily disable.

---

#### `preventRecursion` (required)

**Type**: `boolean`

Prevent the hook from triggering itself recursively.

**Always set to `true`** for hooks that modify files, to avoid infinite loops.

---

### Hook Examples

#### Example 1: Auto-Test on Save

```json
{
  "name": "Auto Test on Save",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.test.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "Run the tests in this file and report the results. If any tests fail, explain what went wrong."
  },
  "enabled": true,
  "preventRecursion": true
}
```

---

#### Example 2: Documentation Check

```json
{
  "name": "Documentation Check",
  "trigger": {
    "type": "onSave",
    "filePattern": "src/**/*.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "Review this file and check if public functions have JSDoc comments. Suggest documentation for any missing comments."
  },
  "enabled": false,
  "preventRecursion": true
}
```

---

#### Example 3: Pre-Commit Validation

```json
{
  "name": "Pre-Commit Validation",
  "trigger": {
    "type": "onPreCommit"
  },
  "action": {
    "type": "prompt",
    "prompt": "Review the staged changes and verify they follow our coding standards. Check for: proper naming, error handling, and comments."
  },
  "enabled": true,
  "preventRecursion": true
}
```

---

#### Example 4: New File Scaffold

```json
{
  "name": "Component Scaffold",
  "trigger": {
    "type": "onFileCreate",
    "filePattern": "**/*.component.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "This is a new component file. Generate the basic component structure following our Angular guidelines."
  },
  "enabled": true,
  "preventRecursion": true
}
```

---

#### Example 5: Manual Code Review

```json
{
  "name": "Code Review",
  "trigger": {
    "type": "manual"
  },
  "action": {
    "type": "prompt",
    "prompt": "Perform a thorough code review of this file. Check for: code quality, potential bugs, performance issues, and adherence to best practices."
  },
  "enabled": true,
  "preventRecursion": false
}
```

---

## MCP Server Configuration

The MCP server is configured through the extension's MCP integration.

### Server Registration

The server is automatically registered when the extension activates. Configuration is in `package.json`:

```json
{
  "mcpServers": {
    "language-tools": {
      "command": "node",
      "args": ["${extensionPath}/server/build/index.js"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Environment Variables

- **`LOG_LEVEL`**: `"debug" | "info" | "warn" | "error"`
  - Controls server logging verbosity
  - Default: `"info"`

### Health Check

The extension performs health checks every 30 seconds and auto-restarts the server on failure (max 3 retries).

---

## Language Configuration

The `language-configuration.json` file defines language-specific editor behavior.

### Schema

```json
{
  "comments": {
    "lineComment": "//",
    "blockComment": ["/*", "*/"]
  },
  "brackets": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  "autoClosingPairs": [
    { "open": "{", "close": "}" },
    { "open": "[", "close": "]" },
    { "open": "(", "close": ")" },
    { "open": "\"", "close": "\"", "notIn": ["string"] }
  ],
  "surroundingPairs": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["\"", "\""]
  ],
  "wordPattern": "(-?\\d*\\.\\d\\w*)|([^\\`\\~\\!\\@\\#\\%\\^\\&\\*\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s]+)"
}
```

### Fields

- **`comments`**: Comment syntax for the language
- **`brackets`**: Bracket pairs for matching
- **`autoClosingPairs`**: Pairs that auto-close when typing
- **`surroundingPairs`**: Pairs used for surrounding selections
- **`wordPattern`**: Regex pattern for word boundaries

---

## JSON Schemas

The extension provides JSON schemas for validation.

### Steering File Schema

Location: `schemas/steering-schema.json`

Validates frontmatter in steering files.

### Hook Schema

Location: `schemas/hook-schema.json`

Validates hook configuration files.

### Using Schemas

Schemas are automatically applied through `package.json` contributes.jsonValidation:

```json
{
  "contributes": {
    "jsonValidation": [
      {
        "fileMatch": ".kiro/hooks/*.json",
        "url": "./schemas/hook-schema.json"
      }
    ]
  }
}
```

---

## Configuration Best Practices

### Steering Files

1. **Start with `always` inclusion** for project-wide rules
2. **Use `fileMatch`** for language/framework-specific rules
3. **Set appropriate priorities** to control loading order
4. **Keep files focused** - one concern per file
5. **Use clear headings** for easy navigation

### Hooks

1. **Start with hooks disabled** (`enabled: false`) and enable after testing
2. **Always use `preventRecursion: true`** for file-modifying hooks
3. **Use specific file patterns** to avoid unnecessary triggers
4. **Test hooks thoroughly** before enabling in production
5. **Provide clear prompts** that explain what the AI should do

### Performance

1. **Limit number of `always` steering files** to reduce context size
2. **Use specific file patterns** in hooks to avoid unnecessary executions
3. **Disable unused features** (LSP, MCP, hooks) if not needed
4. **Monitor extension performance** through performance tests

---

## Troubleshooting Configuration

### Steering Files Not Loading

1. Check frontmatter syntax (must be valid YAML)
2. Verify `fileMatchPattern` uses correct glob syntax
3. Ensure `projectExtensionGrammar.steering.autoLoad` is enabled
4. Check file is in `.kiro/steering/` directory

### Hooks Not Triggering

1. Verify `projectExtensionGrammar.hooks.enabled` is `true`
2. Check `enabled` field in hook config is `true`
3. Verify file pattern matches your files
4. Check hook execution log in Output panel

### Configuration Not Taking Effect

1. Reload window: "Developer: Reload Window"
2. Check for syntax errors in JSON files
3. Verify settings are in correct scope (user vs workspace)
4. Check for conflicting settings

---

## Additional Resources

- [README.md](../README.md) - General documentation
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Development guide
- [Design Document](../.kiro/specs/project-extension-grammar/design.md) - Architecture details
