# Project Extension Grammar

A comprehensive architecture for creating programming language extensions on Kiro IDE with deep AI Agent integration. This extension transforms Kiro from a traditional code editor into a Context Engine where AI can understand and work with your project effectively.

## Overview

Project Extension Grammar provides a 5-layer architecture that bridges deterministic language tooling (TextMate, LSP) with probabilistic AI capabilities:

1. **Syntactic Layer** - TextMate grammar for syntax highlighting and basic parsing
2. **Semantic Layer** - Language Server Protocol integration for code intelligence
3. **Steering Layer** - AI guidance through contextual rules and knowledge files
4. **Workflow Layer** - Event-driven automation through agent hooks
5. **Contextual Layer** - Model Context Protocol for dynamic data access

## Features

### 🎨 Syntactic Layer
- Standard TextMate grammar with validated scope names
- Language configuration for comments, brackets, and auto-closing pairs
- Injection grammar support for embedded languages in Markdown

### 🧠 Semantic Layer
- LSP client with automatic lifecycle management
- Semantic highlighting for accurate token classification
- Definition, references, and hover support
- 500ms response time target for critical operations

### 📋 Steering Layer
- Conditional loading based on file patterns
- Priority-based rule application
- Frontmatter-based configuration
- Automatic reload on file changes
- Template files for coding standards and architecture

### ⚡ Workflow Layer
- Event-driven hooks (onSave, onFileCreate, onPreCommit, manual)
- Recursion prevention for safe automation
- 30-second execution timeout
- Execution history and logging

### 🔌 Contextual Layer
- MCP server integration for dynamic data
- Health checks and auto-restart
- Tool registry for extensibility
- Bundled server support

## Installation

### From VSIX
```bash
code --install-extension project-extension-grammar-0.1.0.vsix
```

### From Source
```bash
git clone <repository-url>
cd project-extension-grammar
npm install
npm run compile
npm run package
code --install-extension project-extension-grammar-0.1.0.vsix
```

## Quick Start

1. **Install the extension** in Kiro IDE

2. **Open a file** with the target language extension (`.targetlang` or `.tlang`)

3. **Initialize Kiro Support** by running the command:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Initialize Kiro Support"
   - Press Enter

4. **Review the created files** in `.kiro/`:
   ```
   .kiro/
   ├── steering/
   │   ├── rules.md          # Coding standards
   │   └── architecture.md   # Project structure
   └── hooks/
       ├── auto-test.json    # Test automation
       └── auto-doc.json     # Documentation automation
   ```

5. **Customize** the steering files and hooks for your project

## Configuration

The extension provides several configuration options accessible through VS Code settings:

### LSP Settings

**`projectExtensionGrammar.lsp.enabled`** (boolean, default: `true`)
- Enable Language Server Protocol integration for semantic analysis

**`projectExtensionGrammar.lsp.serverPath`** (string, default: `""`)
- Path to the language server executable
- Leave empty to use the bundled server

### Steering Settings

**`projectExtensionGrammar.steering.autoLoad`** (boolean, default: `true`)
- Automatically load steering files when opening relevant files

### Hooks Settings

**`projectExtensionGrammar.hooks.enabled`** (boolean, default: `true`)
- Enable agent hooks for automated workflows

### MCP Settings

**`projectExtensionGrammar.mcp.enabled`** (boolean, default: `true`)
- Enable Model Context Protocol server integration

## Steering Files

Steering files are Markdown documents that provide context and rules to the AI Agent.

### File Structure

```markdown
---
inclusion: always | fileMatch | manual
fileMatchPattern: "**/*.ts"  # Required if inclusion is fileMatch
priority: 10                  # Optional, higher = loaded first
---

# Your Content Here

Rules, guidelines, and context for the AI Agent.
```

### Inclusion Types

- **`always`**: Loaded in all contexts (use for project-wide rules)
- **`fileMatch`**: Loaded only when the active file matches the pattern
- **`manual`**: Loaded only when explicitly referenced with `#` in chat

### Example: Coding Standards

```markdown
---
inclusion: always
priority: 10
---

# Coding Standards

## Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_CASE for constants

## Error Handling
- Always use try-catch for async operations
- Provide meaningful error messages
- Log errors with appropriate severity
```

### Example: Framework-Specific Rules

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.component.ts"
priority: 5
---

# Component Guidelines

## Structure
- Keep components under 200 lines
- Use OnPush change detection
- Implement OnDestroy for cleanup

## Testing
- Write unit tests for all public methods
- Mock external dependencies
```

## Agent Hooks

Hooks enable automated workflows triggered by IDE events.

### Hook Configuration

```json
{
  "name": "Hook Name",
  "trigger": {
    "type": "onSave | onFileCreate | onPreCommit | manual",
    "filePattern": "**/*.ts"  // Optional glob pattern
  },
  "action": {
    "type": "prompt | command",
    "prompt": "AI prompt to execute",  // For type: prompt
    "command": "shell command"         // For type: command
  },
  "enabled": true,
  "preventRecursion": true
}
```

### Trigger Types

- **`onSave`**: Executes when a file matching the pattern is saved
- **`onFileCreate`**: Executes when a new file matching the pattern is created
- **`onPreCommit`**: Executes before a git commit
- **`manual`**: Executes only when manually triggered by the user

### Example: Auto-Test Hook

```json
{
  "name": "Auto Test on Save",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.test.ts"
  },
  "action": {
    "type": "prompt",
    "prompt": "Run tests for this file and report results"
  },
  "enabled": true,
  "preventRecursion": true
}
```

### Example: Pre-Commit Validation

```json
{
  "name": "Pre-Commit Check",
  "trigger": {
    "type": "onPreCommit"
  },
  "action": {
    "type": "prompt",
    "prompt": "Review the staged changes and ensure they follow our coding standards"
  },
  "enabled": true,
  "preventRecursion": true
}
```

### Recursion Prevention

The `preventRecursion` flag prevents infinite loops when a hook's action modifies files that would trigger the same hook again. Always set this to `true` for hooks that modify files.

## MCP Tools

The extension can bundle an MCP (Model Context Protocol) server to provide dynamic data to the AI Agent.

### Available Tools

The MCP server can provide tools such as:

- **`fetch_standard_lib_docs`**: Fetch documentation for standard library functions
- **`analyze_dependencies`**: Analyze project dependencies and their versions
- **`scaffold_module`**: Generate boilerplate code for new modules

### Server Configuration

The MCP server is automatically registered when the extension activates. Configuration is managed through the extension's settings.

### Custom Tools

To add custom tools, modify `server/src/index.ts` and implement the tool using the `@modelcontextprotocol/sdk`:

```typescript
server.tool('my_custom_tool', {
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string' }
    }
  }
}, async (params) => {
  // Tool implementation
  return { result: 'data' };
});
```

## Architecture

### Layer Interaction

```
User Action → Syntactic Layer (tokenize) 
           → Semantic Layer (analyze) 
           → Steering Layer (provide context) 
           → AI Agent (understand & act)
           → Workflow Layer (trigger hooks)
```

### Extension Structure

```
extension-root/
├── package.json                 # Extension manifest
├── language-configuration.json  # Language config
├── syntaxes/
│   └── targetlang.tmLanguage.json
├── assets/
│   ├── steering/               # Template steering files
│   └── hooks/                  # Template hook configs
├── server/                     # MCP server (optional)
├── src/
│   ├── extension.ts           # Main entry point
│   ├── syntactic/             # Grammar layer
│   ├── semantic/              # LSP layer
│   ├── steering/              # Steering layer
│   ├── workflow/              # Hooks layer
│   └── contextual/            # MCP layer
└── schemas/                   # JSON schemas for validation
```

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed build, test, and contribution instructions.

## Troubleshooting

### Extension Not Activating

- Ensure you have Kiro IDE version 1.80.0 or higher
- Check that the file extension matches the configured extensions (`.targetlang`, `.tlang`)
- Look for errors in the Output panel (View → Output → Project Extension Grammar)

### LSP Not Working

- Verify `projectExtensionGrammar.lsp.enabled` is set to `true`
- Check the language server path if using a custom server
- Restart the extension with "Developer: Reload Window"

### Hooks Not Triggering

- Ensure `projectExtensionGrammar.hooks.enabled` is set to `true`
- Verify the file pattern matches your files
- Check the hook execution log in the Output panel

### Steering Files Not Loading

- Verify the frontmatter syntax is correct (YAML format)
- Check that `fileMatchPattern` uses valid glob syntax
- Ensure `projectExtensionGrammar.steering.autoLoad` is enabled

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please see [DEVELOPMENT.md](./DEVELOPMENT.md) for guidelines.

## Resources

- [Design Document](.kiro/specs/project-extension-grammar/design.md) - Detailed architecture
- [Requirements Document](.kiro/specs/project-extension-grammar/requirements.md) - Feature requirements
- [TextMate Grammar Guide](https://macromates.com/manual/en/language_grammars)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
