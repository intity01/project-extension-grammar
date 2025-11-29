# Development Guide

This guide provides detailed instructions for building, testing, and contributing to the Project Extension Grammar extension.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- VS Code or Kiro IDE 1.80.0 or higher
- Git

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-extension-grammar
```

### 2. Install Dependencies

Install dependencies for both the extension and the MCP server:

```bash
# Install extension dependencies
npm install

# Install MCP server dependencies
cd server
npm install
cd ..
```

### 3. Open in VS Code

```bash
code .
```

## Building

### Compile TypeScript

Compile the extension and server code:

```bash
npm run compile
```

This will:
- Compile TypeScript files in `src/` to JavaScript in `out/`
- Generate source maps for debugging
- Type-check all code

### Watch Mode

For active development, use watch mode to automatically recompile on changes:

```bash
npm run watch
```

Keep this running in a terminal while you develop.

## Testing

The project uses a comprehensive testing strategy with three types of tests:

### Unit Tests

Test individual components and functions:

```bash
npm test
```

Run specific test files:

```bash
npm test -- src/steering/steering-manager.test.ts
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Property-Based Tests

Verify universal properties across random inputs:

```bash
npm test -- test/property/
```

Property tests use `fast-check` and run 100+ iterations by default.

### Integration Tests

Test full workflows and component interactions:

```bash
npm test -- test/integration/
```

### Performance Tests

Measure performance metrics:

```bash
npm test -- test/performance/
```

Performance targets:
- Extension activation: < 2s
- LSP response time: < 500ms
- Hook execution: < 5s

### Test Coverage

Generate coverage report:

```bash
npm test -- --coverage
```

Target: 80% code coverage

## Running the Extension

### Debug Mode

1. Open the project in VS Code
2. Press `F5` or go to Run → Start Debugging
3. A new Extension Development Host window will open
4. Open a `.targetlang` or `.tlang` file to activate the extension

### Debugging Tips

- Set breakpoints in TypeScript source files
- Use `console.log()` or the `logger` utility for logging
- Check the Debug Console for output
- View extension logs in Output → Project Extension Grammar

## Project Structure

```
project-extension-grammar/
├── .kiro/
│   └── specs/                    # Specification documents
├── assets/
│   ├── steering/                 # Template steering files
│   └── hooks/                    # Template hook configs
├── out/                          # Compiled JavaScript (generated)
├── schemas/
│   ├── steering-schema.json      # Steering file validation
│   └── hook-schema.json          # Hook config validation
├── server/
│   ├── src/
│   │   └── index.ts             # MCP server entry point
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── extension.ts             # Main extension entry point
│   ├── commands/
│   │   └── initialize.ts        # Initialize command
│   ├── syntactic/
│   │   ├── grammar-loader.ts
│   │   ├── incremental-tokenizer.ts
│   │   └── scope-validator.ts
│   ├── semantic/
│   │   ├── lsp-client.ts
│   │   ├── semantic-tokens.ts
│   │   ├── hover-provider.ts
│   │   ├── definition-provider.ts
│   │   └── references-provider.ts
│   ├── steering/
│   │   ├── steering-manager.ts
│   │   ├── file-loader.ts
│   │   └── rule-validator.ts
│   ├── workflow/
│   │   ├── hook-manager.ts
│   │   ├── execution-engine.ts
│   │   └── recursion-guard.ts
│   ├── contextual/
│   │   ├── mcp-manager.ts
│   │   └── tool-registry.ts
│   └── utils/
│       ├── logger.ts
│       ├── config.ts
│       ├── error-handler.ts
│       ├── debounce.ts
│       └── lazy-loader.ts
├── syntaxes/
│   └── targetlang.tmLanguage.json
├── test/
│   ├── unit/                    # Unit tests
│   ├── property/                # Property-based tests
│   ├── integration/             # Integration tests
│   ├── performance/             # Performance tests
│   ├── fixtures/                # Test data
│   └── __mocks__/              # Mock implementations
├── language-configuration.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Code Organization

### Layers

The codebase is organized into 5 layers, each in its own directory:

1. **Syntactic** (`src/syntactic/`) - TextMate grammar and tokenization
2. **Semantic** (`src/semantic/`) - LSP integration and code intelligence
3. **Steering** (`src/steering/`) - AI guidance and rule management
4. **Workflow** (`src/workflow/`) - Hook management and execution
5. **Contextual** (`src/contextual/`) - MCP server integration

### Key Components

- **Managers**: Coordinate lifecycle and state (e.g., `SteeringManager`, `HookManager`)
- **Providers**: Implement VS Code provider interfaces (e.g., `SemanticTokensProvider`)
- **Utilities**: Shared helper functions (e.g., `logger`, `config`)

## Coding Standards

### TypeScript

- Use strict mode (`"strict": true` in tsconfig.json)
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for public functions
- Avoid `any` - use `unknown` if type is truly unknown

### Naming Conventions

- **Files**: kebab-case (e.g., `steering-manager.ts`)
- **Classes**: PascalCase (e.g., `SteeringManager`)
- **Interfaces**: PascalCase (e.g., `SteeringFile`)
- **Functions**: camelCase (e.g., `loadSteeringFiles`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Code Style

- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use async/await instead of raw promises

### Comments

- Add JSDoc comments for public APIs
- Explain "why" not "what" in inline comments
- Document complex algorithms
- Keep comments up-to-date with code changes

### Error Handling

- Use try-catch for async operations
- Provide meaningful error messages
- Log errors with appropriate severity
- Never swallow errors silently

## Testing Guidelines

### Unit Tests

- Test one component at a time
- Mock external dependencies
- Use descriptive test names: `should <expected behavior> when <condition>`
- Follow AAA pattern: Arrange, Act, Assert

Example:
```typescript
describe('SteeringManager', () => {
  it('should load steering file when pattern matches', async () => {
    // Arrange
    const manager = new SteeringManager(workspaceRoot);
    const document = createMockDocument('test.ts');
    
    // Act
    const files = await manager.loadSteeringFiles(document);
    
    // Assert
    expect(files).toHaveLength(1);
    expect(files[0].path).toContain('rules.md');
  });
});
```

### Property-Based Tests

- Test universal properties, not specific examples
- Use smart generators that constrain to valid input space
- Run at least 100 iterations
- Tag with property reference from design doc

Example:
```typescript
// Feature: project-extension-grammar, Property 4: Steering File Conditional Loading
describe('Property 4: Steering File Conditional Loading', () => {
  it('should load files only when pattern matches', () => {
    fc.assert(
      fc.property(
        fc.record({
          pattern: fc.constantFrom('**/*.ts', '**/*.js'),
          filePath: fc.constantFrom('test.ts', 'test.js', 'test.py')
        }),
        async ({ pattern, filePath }) => {
          const shouldLoad = minimatch(filePath, pattern);
          const loaded = await manager.shouldLoadFile(file, document);
          expect(loaded).toBe(shouldLoad);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

- Test realistic workflows
- Use minimal mocking
- Verify end-to-end behavior
- Clean up resources after tests

## Packaging

### Create VSIX Package

```bash
npm run package
```

This creates `project-extension-grammar-<version>.vsix` in the root directory.

### Install Locally

```bash
code --install-extension project-extension-grammar-0.1.0.vsix
```

### Uninstall

```bash
code --uninstall-extension kiro.project-extension-grammar
```

## Publishing

### Prerequisites

- Install vsce: `npm install -g @vscode/vsce`
- Create publisher account on VS Code Marketplace or OpenVSX

### Publish to VS Code Marketplace

```bash
vsce publish
```

### Publish to OpenVSX

```bash
npx ovsx publish project-extension-grammar-0.1.0.vsix
```

## Debugging

### Extension Debugging

1. Set breakpoints in TypeScript files
2. Press F5 to start debugging
3. Extension Development Host opens
4. Trigger the code path you want to debug

### LSP Debugging

Enable LSP tracing in settings:

```json
{
  "projectExtensionGrammar.lsp.trace.server": "verbose"
}
```

View LSP communication in Output → Language Server Protocol

### MCP Debugging

Set log level in MCP server configuration:

```json
{
  "mcpServers": {
    "language-tools": {
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Common Tasks

### Adding a New Command

1. Add command to `package.json` contributes.commands
2. Implement command in `src/commands/`
3. Register command in `src/extension.ts` activate()
4. Add tests in `test/unit/`

### Adding a New Configuration Option

1. Add to `package.json` contributes.configuration.properties
2. Read value using `config.ts` utility
3. Document in README.md
4. Add tests for configuration handling

### Adding a New Steering Template

1. Create file in `assets/steering/`
2. Add frontmatter with inclusion type
3. Document in README.md
4. Update initialization command to copy it

### Adding a New Hook Template

1. Create JSON file in `assets/hooks/`
2. Follow hook schema structure
3. Document in README.md
4. Update initialization command to copy it

### Adding a New MCP Tool

1. Implement tool in `server/src/index.ts`
2. Define input schema
3. Register with MCP server
4. Document in README.md
5. Add tests

## Troubleshooting Development Issues

### TypeScript Compilation Errors

- Run `npm run compile` to see full error output
- Check `tsconfig.json` for correct paths
- Ensure all dependencies are installed

### Tests Failing

- Run tests individually to isolate failures
- Check mock implementations in `test/__mocks__/`
- Verify test fixtures are correct
- Clear Jest cache: `npx jest --clearCache`

### Extension Not Loading in Debug

- Check for compilation errors
- Verify `package.json` activation events
- Look for errors in Debug Console
- Try "Developer: Reload Window"

### Performance Issues

- Run performance tests to identify bottlenecks
- Use Chrome DevTools for profiling
- Check for memory leaks with heap snapshots
- Review caching strategies

## Contributing

### Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit with descriptive message
6. Push to your fork
7. Create a pull request

### Pull Request Guidelines

- Include tests for new features
- Update documentation
- Follow existing code style
- Keep PRs focused on single feature/fix
- Reference related issues

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

Example:
```
feat(steering): add priority-based loading

Implement priority field in steering file frontmatter to control
loading order when multiple files match.

Closes #123
```

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [TextMate Grammar](https://macromates.com/manual/en/language_grammars)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [fast-check Documentation](https://fast-check.dev/)
- [Jest Documentation](https://jestjs.io/)

## Getting Help

- Check existing issues on GitHub
- Review the design document for architecture details
- Ask questions in discussions
- Join the community chat

## License

See LICENSE file for details.
