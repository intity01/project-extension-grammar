# Design Document: Project Extension Grammar

## Overview

Project Extension Grammar เป็นสถาปัตยกรรมแบบครอบคลุม (Comprehensive Architecture) สำหรับการสร้างส่วนขยายภาษาโปรแกรมมิ่งบน Kiro IDE ที่ผสานรวมความสามารถของ AI Agent เข้ากับระบบ IDE แบบดั้งเดิม ระบบนี้ออกแบบมาเพื่อแก้ปัญหาของ "Vibe Coding" โดยการสร้างบริบทที่ชัดเจนและมีโครงสร้างให้กับ AI ผ่าน 5 เลเยอร์หลัก

การออกแบบนี้มุ่งเน้นไปที่การสร้าง "Self-Describable Project" ที่โค้ดเบสไม่เพียงแต่มีโครงสร้างที่ดี แต่ยังสามารถอธิบายตัวเองให้ AI เข้าใจได้ผ่าน Metadata, Rules และ Contextual Information ที่ฝังอยู่ในโครงการ

### Design Goals

1. **Hybrid Architecture**: ผสานระบบ Deterministic (TextMate, LSP) กับ Probabilistic (AI Agent) อย่างลงตัว
2. **Backward Compatibility**: รักษาความเข้ากันได้กับ VS Code Extensions ที่มีอยู่
3. **Progressive Enhancement**: ส่วนขยายสามารถทำงานได้แม้ไม่มี AI แต่จะมีประสิทธิภาพสูงสุดเมื่อมี AI
4. **Extensibility**: สามารถขยายความสามารถผ่าน MCP และ Custom Hooks ได้
5. **Performance**: ตอบสนองเร็วพอที่จะไม่รบกวนการทำงานของผู้ใช้

## Architecture

### High-Level Architecture

ระบบประกอบด้วย 5 เลเยอร์ที่ทำงานร่วมกันแบบ Stack:

```
┌─────────────────────────────────────────┐
│     User Interface (Kiro IDE)           │
├─────────────────────────────────────────┤
│  Contextual Layer (MCP)                 │  ← Dynamic Data
├─────────────────────────────────────────┤
│  Workflow Layer (Hooks)                 │  ← Automation
├─────────────────────────────────────────┤
│  Steering Layer (Rules & Knowledge)     │  ← AI Guidance
├─────────────────────────────────────────┤
│  Semantic Layer (LSP)                   │  ← Code Intelligence
├─────────────────────────────────────────┤
│  Syntactic Layer (TextMate)             │  ← Basic Parsing
└─────────────────────────────────────────┘
```

### Layer Interaction Flow

1. **Read Flow**: User opens file → Syntactic Layer tokenizes → Semantic Layer analyzes → Steering Layer provides context → AI Agent understands
2. **Write Flow**: AI Agent generates code → Steering Layer validates rules → Semantic Layer checks types → Syntactic Layer formats → File saved → Workflow Layer triggers hooks

### Extension Package Structure

```
extension-root/
├── package.json                 # Extension manifest
├── language-configuration.json  # Language config
├── syntaxes/
│   └── language.tmLanguage.json # TextMate grammar
├── assets/
│   ├── steering/               # Steering templates
│   │   ├── rules.md
│   │   └── architecture.md
│   └── hooks/                  # Hook templates
│       ├── auto-test.json
│       └── auto-doc.json
├── server/                     # MCP Server (optional)
│   ├── package.json
│   └── src/
│       └── index.ts
├── src/
│   ├── extension.ts           # Main extension code
│   ├── lsp-client.ts          # LSP integration
│   └── initialization.ts      # Setup commands
└── schemas/
    └── steering-schema.json   # Validation schema
```

## Components and Interfaces

### 1. Syntactic Layer Components

#### 1.1 TextMate Grammar Engine

**Purpose**: แปลงโค้ดเป็น Token Stream พร้อม Scope Information

**Interface**:
```typescript
interface TokenInfo {
  text: string;
  scopes: string[];  // e.g., ["source.lang", "keyword.control.if"]
  range: Range;
}

interface GrammarEngine {
  tokenizeLine(line: string, state?: any): TokenizeResult;
  getScopeAt(position: Position): string[];
}
```

**Key Design Decisions**:
- ใช้ Standard Scope Names เท่านั้นเพื่อความเข้ากันได้
- รองรับ Injection Grammar สำหรับ Embedded Languages
- Cache tokenization results เพื่อประสิทธิภาพ

#### 1.2 Language Configuration Manager

**Purpose**: จัดการพฤติกรรมการแก้ไขอัตโนมัติ

**Interface**:
```typescript
interface LanguageConfiguration {
  comments: {
    lineComment?: string;
    blockComment?: [string, string];
  };
  brackets: [string, string][];
  autoClosingPairs: AutoClosingPair[];
  surroundingPairs: SurroundingPair[];
  wordPattern?: RegExp;
}
```

### 2. Semantic Layer Components

#### 2.1 LSP Client Manager

**Purpose**: จัดการการสื่อสารกับ Language Server

**Interface**:
```typescript
interface LSPClientManager {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendRequest<T>(method: string, params: any): Promise<T>;
  onNotification(method: string, handler: (params: any) => void): void;
}

interface SemanticInfo {
  definitions: Location[];
  references: Location[];
  hover: Hover | null;
  symbols: DocumentSymbol[];
}
```

**Key Design Decisions**:
- ใช้ vscode-languageclient library สำหรับ VS Code compatibility
- Implement connection retry logic with exponential backoff
- Cache semantic information with TTL (Time To Live)
- Timeout ที่ 500ms สำหรับ critical operations

#### 2.2 Semantic Token Provider

**Purpose**: ให้ข้อมูล Semantic Highlighting

**Interface**:
```typescript
interface SemanticTokensProvider {
  provideDocumentSemanticTokens(
    document: TextDocument
  ): ProviderResult<SemanticTokens>;
}
```

### 3. Steering Layer Components

#### 3.1 Steering File Manager

**Purpose**: โหลดและจัดการ Steering Files ตาม Context

**Interface**:
```typescript
interface SteeringFile {
  path: string;
  content: string;
  frontmatter: {
    inclusion: 'always' | 'fileMatch' | 'manual';
    fileMatchPattern?: string;
  };
}

interface SteeringManager {
  loadSteeringFiles(context: FileContext): Promise<SteeringFile[]>;
  getActiveRules(document: TextDocument): Promise<string[]>;
  validateSteeringFile(file: SteeringFile): ValidationResult;
}
```

**Key Design Decisions**:
- ใช้ gray-matter library สำหรับ parse Frontmatter
- Implement file watcher เพื่อ reload เมื่อมีการเปลี่ยนแปลง
- Priority: Project-level > Global-level
- Cache parsed files แต่ invalidate เมื่อมีการแก้ไข

#### 3.2 Rule Validator

**Purpose**: ตรวจสอบความถูกต้องของ Steering Files

**Interface**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface RuleValidator {
  validateSyntax(content: string): ValidationResult;
  validateFrontmatter(frontmatter: any): ValidationResult;
  validateFileMatchPattern(pattern: string): boolean;
}
```

### 4. Workflow Layer Components

#### 4.1 Hook Manager

**Purpose**: จัดการและเรียกใช้ Agent Hooks

**Interface**:
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
}

interface HookManager {
  loadHooks(): Promise<Hook[]>;
  registerHook(hook: Hook): void;
  executeHook(hook: Hook, context: HookContext): Promise<void>;
  preventRecursion(hook: Hook): boolean;
}
```

**Key Design Decisions**:
- ใช้ execution stack เพื่อตรวจจับ recursive triggers
- Implement timeout (30 seconds) สำหรับ hook execution
- Log all hook executions สำหรับ debugging
- Allow users to disable hooks temporarily

#### 4.2 Hook Execution Engine

**Purpose**: รัน Hook Actions อย่างปลอดภัย

**Interface**:
```typescript
interface HookContext {
  document: TextDocument;
  changes?: TextDocumentChangeEvent;
  workspace: WorkspaceFolder;
}

interface ExecutionEngine {
  execute(hook: Hook, context: HookContext): Promise<ExecutionResult>;
  cancel(executionId: string): void;
  getExecutionHistory(): ExecutionRecord[];
}
```

### 5. Contextual Layer Components

#### 5.1 MCP Server Manager

**Purpose**: จัดการ MCP Server lifecycle และ communication

**Interface**:
```typescript
interface MCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface MCPManager {
  registerServer(server: MCPServer): Promise<void>;
  callTool(serverName: string, toolName: string, args: any): Promise<any>;
  listTools(serverName: string): Promise<ToolInfo[]>;
  getServerStatus(serverName: string): ServerStatus;
}
```

**Key Design Decisions**:
- Bundle MCP server code ใน extension package
- ใช้ stdio transport สำหรับ communication
- Implement health check ทุก 30 วินาที
- Auto-restart on crash (max 3 retries)

#### 5.2 Tool Registry

**Purpose**: จัดเก็บและจัดการ MCP Tools

**Interface**:
```typescript
interface ToolInfo {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

interface ToolRegistry {
  registerTool(tool: ToolInfo): void;
  getTool(name: string): ToolInfo | undefined;
  listTools(): ToolInfo[];
}
```

## Data Models

### Extension Manifest (package.json)

```typescript
interface ExtensionManifest {
  name: string;
  displayName: string;
  description: string;
  version: string;
  engines: {
    vscode: string;  // "^1.80.0"
  };
  categories: string[];
  contributes: {
    languages: LanguageContribution[];
    grammars: GrammarContribution[];
    commands?: CommandContribution[];
    jsonValidation?: JSONValidationContribution[];
  };
}

interface LanguageContribution {
  id: string;
  extensions: string[];
  configuration: string;
}

interface GrammarContribution {
  language: string;
  scopeName: string;
  path: string;
  injections?: Record<string, InjectionGrammar>;
}
```

### Steering File Format

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.lang"
priority: 10
---

# Steering Content

## Section 1
Rules and guidelines...

## Section 2
More rules...
```

```typescript
interface SteeringFileParsed {
  metadata: {
    inclusion: 'always' | 'fileMatch' | 'manual';
    fileMatchPattern?: string;
    priority?: number;
  };
  sections: {
    title: string;
    content: string;
  }[];
}
```

### Hook Configuration Format

```json
{
  "name": "Auto Test on Save",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.test.lang"
  },
  "action": {
    "type": "prompt",
    "prompt": "Run tests for this file and report results"
  },
  "enabled": true,
  "preventRecursion": true
}
```

```typescript
interface HookConfig {
  name: string;
  trigger: TriggerConfig;
  action: ActionConfig;
  enabled: boolean;
  preventRecursion: boolean;
}
```

### MCP Server Configuration

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

```typescript
interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  disabled?: boolean;
  autoApprove?: string[];
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Standard Scope Name Compliance

*For any* .tmLanguage.json file, all scope names used in the grammar SHALL be from the standard TextMate scope name list (comment.*, keyword.*, storage.*, string.*, entity.*, variable.*, constant.*, support.*, meta.*)

**Validates: Requirements 1.1**

**Rationale**: Using non-standard scope names breaks theme compatibility and confuses AI agents about token types. By validating that all scopes conform to the standard, we ensure consistent highlighting and semantic understanding across different themes and contexts.

### Property 2: Language Configuration Completeness

*For any* language-configuration.json file, it SHALL contain at minimum the `comments` field with either `lineComment` or `blockComment` defined, and the `brackets` field with at least one bracket pair

**Validates: Requirements 1.4**

**Rationale**: These are the minimum fields required for basic editing functionality. Without comment definitions, the AI cannot properly comment code. Without bracket definitions, bracket matching and auto-closing won't work.

### Property 3: Comment Syntax Consistency

*For any* language configuration with defined comment syntax, when the comment operation is invoked on a line or block, the output SHALL use exactly the comment syntax specified in the configuration

**Validates: Requirements 1.5**

**Rationale**: This ensures that the system respects the language configuration and doesn't fall back to incorrect comment syntax, which would break the code.

### Property 4: Steering File Conditional Loading

*For any* steering file with `inclusion: fileMatch` and a `fileMatchPattern`, the file SHALL be loaded if and only if the currently active document matches the pattern

**Validates: Requirements 3.3**

**Rationale**: This prevents context pollution where irrelevant rules are loaded into the AI's context window. For example, Python rules shouldn't be active when editing JavaScript files.

### Property 5: Hook Trigger Matching

*For any* hook with trigger type `onSave` and a `filePattern`, the hook SHALL execute if and only if a saved file's path matches the pattern

**Validates: Requirements 4.3**

**Rationale**: Hooks should only run when relevant to avoid unnecessary processing and potential side effects on unrelated files.

### Property 6: Hook Recursion Prevention

*For any* hook execution that modifies a file, if that modification would trigger the same hook again, the system SHALL prevent the recursive trigger

**Validates: Requirements 4.4**

**Rationale**: Without recursion prevention, a hook that saves a file it just modified would trigger itself infinitely, freezing the IDE.

### Property 7: Package Manifest Completeness

*For any* extension package.json that declares language support, it SHALL contain:
- `engines.vscode` with version >= 1.80.0
- `contributes.languages` with at least one language entry containing `id`, `extensions`, and `configuration`
- `contributes.grammars` with at least one grammar entry containing `language`, `scopeName`, and `path`

**Validates: Requirements 6.1, 6.2, 6.3**

**Rationale**: These are the minimum required fields for VS Code/Kiro to recognize and activate language support. Missing any of these will cause the extension to fail silently.

### Property 8: Initialization Idempotence

*For any* project, running the `initializeKiro` command multiple times SHALL result in the same final state as running it once (files are copied but not duplicated, existing files are not overwritten without confirmation)

**Validates: Requirements 3.2, 4.2, 8.3**

**Rationale**: Users may accidentally run initialization multiple times. The operation should be safe to repeat without corrupting the project structure or losing custom modifications.

### Property 9: Configuration Validation with Error Reporting

*For any* invalid configuration file (steering file with syntax errors, hook with missing required fields, or invalid fileMatchPattern), the system SHALL:
1. Reject loading the configuration
2. Display an error message identifying the file and error type
3. Continue operating with remaining valid configurations

**Validates: Requirements 10.1, 10.2, 10.4**

**Rationale**: Invalid configurations should fail gracefully without crashing the extension. Users need clear feedback about what's wrong and where, while the rest of the system continues to function.

## Error Handling

### Error Categories

1. **Configuration Errors**: Invalid JSON, missing required fields, malformed patterns
2. **Runtime Errors**: LSP server crashes, MCP server failures, hook execution timeouts
3. **Resource Errors**: File not found, permission denied, disk full
4. **Validation Errors**: Invalid scope names, circular hook dependencies

### Error Handling Strategy

#### Configuration Errors

**Detection**: Validate all configuration files on load using JSON Schema validation
**Response**: 
- Log detailed error with file path and line number
- Show user notification with actionable message
- Fall back to safe defaults where possible
- Continue loading other valid configurations

**Example**:
```typescript
try {
  const config = JSON.parse(configContent);
  validateSchema(config, hookSchema);
} catch (error) {
  logger.error(`Invalid hook configuration in ${filePath}:`, error);
  vscode.window.showErrorMessage(
    `Hook configuration error in ${path.basename(filePath)}: ${error.message}. ` +
    `This hook will be disabled. Click here to view the file.`,
    'View File'
  ).then(action => {
    if (action === 'View File') {
      vscode.window.showTextDocument(vscode.Uri.file(filePath));
    }
  });
  return null; // Skip this hook
}
```

#### Runtime Errors

**LSP Server Crashes**:
- Detect via process exit event
- Attempt restart with exponential backoff (1s, 2s, 4s)
- After 3 failed attempts, show error and disable LSP features
- Provide "Restart Language Server" command

**MCP Server Failures**:
- Implement health check every 30 seconds
- On failure, attempt restart once
- If restart fails, show error and mark server as unavailable
- Continue operating without MCP features

**Hook Execution Timeouts**:
- Set 30-second timeout for all hook executions
- On timeout, kill the process and show warning
- Log execution time for performance monitoring
- Provide option to disable slow hooks

#### Resource Errors

**File Operations**:
```typescript
async function copyTemplate(src: string, dest: string): Promise<void> {
  try {
    await fs.promises.copyFile(src, dest);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Template file not found: ${src}`);
    } else if (error.code === 'EACCES') {
      throw new Error(`Permission denied writing to: ${dest}`);
    } else if (error.code === 'ENOSPC') {
      throw new Error(`Disk full, cannot write to: ${dest}`);
    } else {
      throw error;
    }
  }
}
```

#### Validation Errors

**Scope Name Validation**:
```typescript
const STANDARD_SCOPES = [
  'comment', 'constant', 'entity', 'invalid', 'keyword',
  'markup', 'meta', 'storage', 'string', 'support', 'variable'
];

function validateScopeName(scope: string): boolean {
  const parts = scope.split('.');
  return STANDARD_SCOPES.includes(parts[0]);
}
```

### Error Recovery

1. **Graceful Degradation**: If advanced features fail, fall back to basic functionality
2. **State Preservation**: Never corrupt user data during error recovery
3. **User Communication**: Always inform users of errors with actionable next steps
4. **Logging**: Log all errors with context for debugging

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining traditional unit tests with property-based tests to ensure comprehensive coverage of both specific scenarios and general correctness properties.

### Unit Testing

**Purpose**: Verify specific examples, edge cases, and integration points

**Framework**: Jest (for TypeScript/JavaScript extensions)

**Coverage Areas**:

1. **Configuration Parsing**
   - Valid configuration files parse correctly
   - Invalid JSON is rejected with appropriate errors
   - Missing optional fields use correct defaults

2. **File Operations**
   - Template files are copied to correct locations
   - Existing files are not overwritten without confirmation
   - File permissions are preserved

3. **LSP Integration**
   - Client connects to server successfully
   - Requests timeout appropriately
   - Server crashes are handled gracefully

4. **Hook Execution**
   - Hooks trigger on correct events
   - Hook actions execute with proper context
   - Timeouts are enforced

**Example Unit Test**:
```typescript
describe('SteeringManager', () => {
  it('should load steering file with fileMatch inclusion', async () => {
    const manager = new SteeringManager(workspaceRoot);
    const document = createMockDocument('test.lang');
    
    const files = await manager.loadSteeringFiles(document);
    
    expect(files).toHaveLength(1);
    expect(files[0].path).toContain('rules.md');
  });
  
  it('should not load steering file when pattern does not match', async () => {
    const manager = new SteeringManager(workspaceRoot);
    const document = createMockDocument('test.py');
    
    const files = await manager.loadSteeringFiles(document);
    
    expect(files).toHaveLength(0);
  });
});
```

### Property-Based Testing

**Purpose**: Verify universal properties that should hold across all inputs

**Framework**: fast-check (for TypeScript/JavaScript)

**Configuration**: Each property test should run a minimum of 100 iterations to ensure adequate coverage of the input space.

**Tagging Convention**: Each property-based test MUST be tagged with a comment explicitly referencing the correctness property from this design document using the format:
```typescript
// Feature: project-extension-grammar, Property 1: Standard Scope Name Compliance
```

**Coverage Areas**:

1. **Grammar Validation** (Property 1)
   - Generate random .tmLanguage.json structures
   - Verify all scope names are standard

2. **Configuration Completeness** (Property 2)
   - Generate random language-configuration.json files
   - Verify required fields are present

3. **Pattern Matching** (Properties 4, 5)
   - Generate random file paths and patterns
   - Verify matching behavior is consistent

4. **Idempotence** (Property 8)
   - Run initialization multiple times
   - Verify final state is identical

**Example Property Test**:
```typescript
import fc from 'fast-check';

// Feature: project-extension-grammar, Property 1: Standard Scope Name Compliance
describe('Property 1: Standard Scope Name Compliance', () => {
  it('should only accept standard scope names in grammar', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(
          fc.constant('comment.line'),
          fc.constant('keyword.control'),
          fc.constant('string.quoted'),
          fc.constant('invalid.scope.name') // Invalid scope
        )),
        (scopes) => {
          const grammar = { patterns: scopes.map(s => ({ name: s })) };
          const result = validateGrammar(grammar);
          
          const hasInvalidScope = scopes.some(s => s === 'invalid.scope.name');
          expect(result.valid).toBe(!hasInvalidScope);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: project-extension-grammar, Property 4: Steering File Conditional Loading
describe('Property 4: Steering File Conditional Loading', () => {
  it('should load steering files only when pattern matches', () => {
    fc.assert(
      fc.property(
        fc.record({
          pattern: fc.oneof(
            fc.constant('**/*.lang'),
            fc.constant('**/*.test.lang'),
            fc.constant('src/**/*.lang')
          ),
          filePath: fc.oneof(
            fc.constant('test.lang'),
            fc.constant('test.test.lang'),
            fc.constant('src/module.lang'),
            fc.constant('test.py')
          )
        }),
        async ({ pattern, filePath }) => {
          const steeringFile = createSteeringFile(pattern);
          const document = createMockDocument(filePath);
          
          const shouldLoad = minimatch(filePath, pattern);
          const loaded = await manager.shouldLoadFile(steeringFile, document);
          
          expect(loaded).toBe(shouldLoad);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: project-extension-grammar, Property 6: Hook Recursion Prevention
describe('Property 6: Hook Recursion Prevention', () => {
  it('should prevent infinite recursion in hooks', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        async (depth) => {
          const executionCount = { count: 0 };
          const hook = createRecursiveHook(() => {
            executionCount.count++;
          });
          
          await hookManager.executeHook(hook, mockContext);
          
          // Should execute only once despite recursive trigger
          expect(executionCount.count).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: project-extension-grammar, Property 8: Initialization Idempotence
describe('Property 8: Initialization Idempotence', () => {
  it('should produce same result when run multiple times', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        async (runCount) => {
          const workspace = createTempWorkspace();
          
          // Run initialization multiple times
          for (let i = 0; i < runCount; i++) {
            await initializeKiro(workspace);
          }
          
          const finalState = await getWorkspaceState(workspace);
          
          // Run once more and verify state is unchanged
          await initializeKiro(workspace);
          const newState = await getWorkspaceState(workspace);
          
          expect(newState).toEqual(finalState);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Purpose**: Verify components work together correctly

**Scenarios**:
1. Full extension activation flow
2. LSP + Semantic highlighting integration
3. Steering files + Hook execution
4. MCP server + AI agent interaction

### Test Data Management

**Fixtures**:
- Sample .tmLanguage.json files (valid and invalid)
- Sample language-configuration.json files
- Sample steering files with various frontmatter configurations
- Sample hook configurations

**Generators** (for property-based testing):
```typescript
// Generate valid scope names
const scopeNameArb = fc.oneof(
  fc.constant('comment.line'),
  fc.constant('comment.block'),
  fc.constant('keyword.control'),
  fc.constant('string.quoted.double'),
  // ... more standard scopes
);

// Generate file patterns
const filePatternArb = fc.oneof(
  fc.constant('**/*.lang'),
  fc.constant('src/**/*.lang'),
  fc.constant('*.test.lang')
);

// Generate steering file frontmatter
const frontmatterArb = fc.record({
  inclusion: fc.constantFrom('always', 'fileMatch', 'manual'),
  fileMatchPattern: fc.option(filePatternArb),
  priority: fc.option(fc.integer({ min: 0, max: 100 }))
});
```

### Continuous Integration

**Pre-commit**:
- Run unit tests
- Run linter
- Validate all JSON schemas

**Pull Request**:
- Run full test suite (unit + property + integration)
- Check code coverage (target: 80%)
- Run performance benchmarks

**Release**:
- Run extended property tests (1000 iterations)
- Manual testing in Kiro IDE
- Validate package structure

### Performance Testing

**Metrics to Track**:
- LSP response time (target: < 500ms)
- Hook execution time (target: < 5s)
- Extension activation time (target: < 2s)
- Memory usage (target: < 100MB)

**Tools**:
- VS Code Extension Test Runner
- Chrome DevTools for profiling
- Custom performance logging


## Implementation Details

### Technology Stack

**Core Extension**:
- TypeScript 5.0+
- VS Code Extension API 1.80+
- Node.js 18+

**LSP Integration**:
- vscode-languageclient 8.0+
- vscode-languageserver 8.0+
- vscode-languageserver-protocol 3.17+

**Property-Based Testing**:
- fast-check 3.0+ (for TypeScript)
- Jest 29+ (test runner)

**MCP Integration**:
- @modelcontextprotocol/sdk 0.5+
- stdio transport

**Utilities**:
- gray-matter (Frontmatter parsing)
- minimatch (Pattern matching)
- ajv (JSON Schema validation)

### File Structure Details

```
extension/
├── package.json
├── tsconfig.json
├── .vscodeignore
├── language-configuration.json
├── syntaxes/
│   └── targetlang.tmLanguage.json
├── assets/
│   ├── steering/
│   │   ├── rules.md
│   │   ├── architecture.md
│   │   └── best-practices.md
│   └── hooks/
│       ├── auto-test.json
│       ├── auto-doc.json
│       └── pre-commit-check.json
├── schemas/
│   ├── steering-schema.json
│   └── hook-schema.json
├── server/                    # MCP Server (optional)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── tools/
│       │   ├── fetch-docs.ts
│       │   ├── analyze-deps.ts
│       │   └── scaffold-module.ts
│       └── utils/
│           └── parser.ts
├── src/
│   ├── extension.ts           # Main entry point
│   ├── activation.ts          # Activation logic
│   ├── commands/
│   │   ├── initialize.ts      # initializeKiro command
│   │   └── validate.ts        # Validation commands
│   ├── syntactic/
│   │   ├── grammar-loader.ts
│   │   └── scope-validator.ts
│   ├── semantic/
│   │   ├── lsp-client.ts
│   │   ├── semantic-tokens.ts
│   │   └── hover-provider.ts
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
│   │   ├── tool-registry.ts
│   │   └── server-health.ts
│   └── utils/
│       ├── logger.ts
│       ├── config.ts
│       └── file-utils.ts
├── test/
│   ├── unit/
│   │   ├── steering.test.ts
│   │   ├── hooks.test.ts
│   │   └── validation.test.ts
│   ├── property/
│   │   ├── grammar.property.test.ts
│   │   ├── pattern-matching.property.test.ts
│   │   └── idempotence.property.test.ts
│   ├── integration/
│   │   └── full-flow.test.ts
│   └── fixtures/
│       ├── grammars/
│       ├── configs/
│       └── steering/
└── docs/
    ├── README.md
    ├── DEVELOPMENT.md
    └── API.md
```

### Key Implementation Patterns

#### 1. Lazy Loading Pattern

Load components only when needed to minimize activation time:

```typescript
class ExtensionContext {
  private _lspClient?: LSPClientManager;
  private _steeringManager?: SteeringManager;
  private _hookManager?: HookManager;
  
  get lspClient(): LSPClientManager {
    if (!this._lspClient) {
      this._lspClient = new LSPClientManager(this.config);
    }
    return this._lspClient;
  }
  
  // Similar for other managers
}
```

#### 2. Event-Driven Architecture

Use VS Code's event system for loose coupling:

```typescript
// In extension.ts
const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{lang}');

fileWatcher.onDidSave(async (uri) => {
  await hookManager.triggerHooks('onSave', { uri });
});

fileWatcher.onDidCreate(async (uri) => {
  await hookManager.triggerHooks('onFileCreate', { uri });
});
```

#### 3. Caching Strategy

Cache expensive operations with TTL:

```typescript
class CachedSteeringManager {
  private cache = new Map<string, { data: SteeringFile, timestamp: number }>();
  private TTL = 60000; // 1 minute
  
  async loadSteeringFile(path: string): Promise<SteeringFile> {
    const cached = this.cache.get(path);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }
    
    const data = await this.loadFromDisk(path);
    this.cache.set(path, { data, timestamp: Date.now() });
    return data;
  }
}
```

#### 4. Error Boundary Pattern

Isolate failures to prevent cascade:

```typescript
async function safeExecuteHook(hook: Hook, context: HookContext): Promise<void> {
  try {
    await executeHook(hook, context);
  } catch (error) {
    logger.error(`Hook ${hook.name} failed:`, error);
    vscode.window.showErrorMessage(
      `Hook "${hook.name}" failed: ${error.message}`
    );
    // Continue execution, don't throw
  }
}
```

### Configuration Management

#### Extension Settings

Expose settings through VS Code's configuration system:

```json
{
  "targetLang.lsp.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Enable Language Server Protocol support"
  },
  "targetLang.lsp.serverPath": {
    "type": "string",
    "default": "",
    "description": "Path to language server executable (leave empty for bundled)"
  },
  "targetLang.steering.autoLoad": {
    "type": "boolean",
    "default": true,
    "description": "Automatically load steering files"
  },
  "targetLang.hooks.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Enable agent hooks"
  },
  "targetLang.mcp.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Enable MCP server"
  }
}
```

#### Runtime Configuration

Allow dynamic configuration through workspace settings:

```typescript
function getConfig<T>(key: string, defaultValue: T): T {
  return vscode.workspace
    .getConfiguration('targetLang')
    .get<T>(key, defaultValue);
}

// Usage
const lspEnabled = getConfig('lsp.enabled', true);
```

### Security Considerations

#### 1. Steering File Validation

Prevent code injection through steering files:

```typescript
function sanitizeSteeringContent(content: string): string {
  // Remove any script tags or dangerous HTML
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}
```

#### 2. Hook Execution Sandboxing

Limit hook capabilities:

```typescript
const ALLOWED_COMMANDS = [
  'test',
  'lint',
  'format',
  'build'
];

function validateHookCommand(command: string): boolean {
  return ALLOWED_COMMANDS.some(allowed => command.startsWith(allowed));
}
```

#### 3. MCP Server Isolation

Run MCP server in separate process with limited permissions:

```typescript
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'production',
    // Limit environment variables
  },
  // Run with limited permissions if possible
});
```

### Performance Optimization

#### 1. Incremental Parsing

Only re-parse changed portions:

```typescript
class IncrementalGrammarEngine {
  private tokenCache = new Map<number, TokenInfo[]>();
  
  tokenizeDocument(document: TextDocument, changes: TextDocumentContentChangeEvent[]): void {
    for (const change of changes) {
      const startLine = change.range.start.line;
      const endLine = change.range.end.line;
      
      // Invalidate affected lines
      for (let i = startLine; i <= endLine; i++) {
        this.tokenCache.delete(i);
      }
      
      // Re-tokenize only affected lines
      for (let i = startLine; i <= endLine; i++) {
        this.tokenCache.set(i, this.tokenizeLine(document.lineAt(i).text));
      }
    }
  }
}
```

#### 2. Debouncing

Prevent excessive operations:

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage
const debouncedValidation = debounce(validateDocument, 500);
```

#### 3. Worker Threads

Offload heavy computation:

```typescript
import { Worker } from 'worker_threads';

async function validateGrammarInWorker(grammar: any): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./grammar-validator-worker.js');
    worker.postMessage(grammar);
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

### Monitoring and Telemetry

#### Metrics to Collect

```typescript
interface Metrics {
  activationTime: number;
  lspResponseTimes: number[];
  hookExecutionTimes: Map<string, number[]>;
  steeringFilesLoaded: number;
  mcpToolCalls: Map<string, number>;
  errors: ErrorLog[];
}

class MetricsCollector {
  private metrics: Metrics = {
    activationTime: 0,
    lspResponseTimes: [],
    hookExecutionTimes: new Map(),
    steeringFilesLoaded: 0,
    mcpToolCalls: new Map(),
    errors: []
  };
  
  recordLSPResponse(duration: number): void {
    this.metrics.lspResponseTimes.push(duration);
  }
  
  getAverageLSPResponseTime(): number {
    const times = this.metrics.lspResponseTimes;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}
```

### Deployment Strategy

#### 1. Packaging

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Package extension
vsce package
```

#### 2. Publishing

```bash
# Publish to OpenVSX
npx ovsx publish extension-1.0.0.vsix -p $OPENVSX_TOKEN

# Or distribute .vsix directly
```

#### 3. Versioning

Follow Semantic Versioning:
- MAJOR: Breaking changes to API or configuration format
- MINOR: New features, new properties
- PATCH: Bug fixes, performance improvements

### Migration and Upgrade Path

#### Version Compatibility

```typescript
interface VersionInfo {
  extension: string;
  configFormat: string;
  minKiroVersion: string;
}

function checkCompatibility(workspace: WorkspaceFolder): CompatibilityResult {
  const config = loadConfig(workspace);
  
  if (config.version < '2.0.0') {
    return {
      compatible: false,
      message: 'Configuration format has changed. Run migration command.',
      migrationAvailable: true
    };
  }
  
  return { compatible: true };
}
```

#### Migration Commands

```typescript
vscode.commands.registerCommand('targetLang.migrateConfig', async () => {
  const oldConfig = await loadOldConfig();
  const newConfig = migrateToNewFormat(oldConfig);
  await saveConfig(newConfig);
  vscode.window.showInformationMessage('Configuration migrated successfully');
});
```

## Appendix

### A. Standard Scope Names Reference

Complete list of standard TextMate scope names:

**Comments**:
- comment.line.double-slash
- comment.line.number-sign
- comment.block
- comment.block.documentation

**Constants**:
- constant.numeric
- constant.character
- constant.language
- constant.other

**Entities**:
- entity.name.function
- entity.name.type
- entity.name.tag
- entity.name.section
- entity.other.inherited-class
- entity.other.attribute-name

**Keywords**:
- keyword.control
- keyword.operator
- keyword.other

**Storage**:
- storage.type
- storage.modifier

**Strings**:
- string.quoted.single
- string.quoted.double
- string.quoted.triple
- string.unquoted
- string.regexp

**Support**:
- support.function
- support.class
- support.type
- support.constant
- support.variable

**Variables**:
- variable.parameter
- variable.language
- variable.other

### B. Example Steering File Templates

#### rules.md
```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.lang"
priority: 10
---

# TargetLang Coding Rules

## Philosophy

TargetLang emphasizes memory safety and explicit error handling.

## Naming Conventions

- Functions: `snake_case`
- Types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Private members: prefix with `_`

## Error Handling

Always use `Result<T, E>` for operations that can fail. Never use exceptions.

```lang
// Good
fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}

// Bad
fn divide(a: i32, b: i32) -> i32 {
    a / b  // Can panic!
}
```

## Preferred Libraries

- HTTP: `reqwest`
- JSON: `serde_json`
- Async: `tokio`
```

#### architecture.md
```markdown
---
inclusion: always
---

# TargetLang Project Structure

## Standard Layout

```
project/
├── src/           # Source code
│   ├── main.lang  # Entry point
│   └── lib/       # Library modules
├── tests/         # Integration tests
├── examples/      # Usage examples
└── docs/          # Documentation
```

## Module Organization

- One module per file
- Public API in `lib/mod.lang`
- Internal utilities in `lib/internal/`
- Tests colocated with source (in same file)

## File Naming

- Module files: `snake_case.lang`
- Test files: `module_name.test.lang`
- Example files: `example_name.example.lang`
```

### C. Example Hook Configurations

#### auto-test.json
```json
{
  "name": "Run Tests on Save",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.lang"
  },
  "action": {
    "type": "prompt",
    "prompt": "Run the tests for the saved file. If any tests fail, analyze the failure and explain the root cause concisely. Do not modify code unless explicitly requested."
  },
  "enabled": true,
  "preventRecursion": true
}
```

#### auto-doc.json
```json
{
  "name": "Generate Documentation",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/src/**/*.lang"
  },
  "action": {
    "type": "prompt",
    "prompt": "Check if any public functions are missing documentation comments. If found, suggest documentation following the project's documentation style."
  },
  "enabled": true,
  "preventRecursion": true
}
```

### D. MCP Server Tool Examples

#### fetch_standard_lib_docs
```typescript
server.tool(
  'fetch_standard_lib_docs',
  'Fetch documentation for standard library functions',
  {
    query: z.string().describe('Function or module name to look up')
  },
  async ({ query }) => {
    const docs = await loadStandardLibDocs();
    const result = docs.find(d => d.name === query);
    
    if (!result) {
      return { content: [{ type: 'text', text: `No documentation found for ${query}` }] };
    }
    
    return {
      content: [{
        type: 'text',
        text: `# ${result.name}\n\n${result.description}\n\n## Signature\n\`\`\`lang\n${result.signature}\n\`\`\``
      }]
    };
  }
);
```

#### analyze_dependencies
```typescript
server.tool(
  'analyze_dependencies',
  'Analyze project dependencies from manifest file',
  {},
  async () => {
    const manifestPath = path.join(workspaceRoot, 'manifest.toml');
    const manifest = await fs.readFile(manifestPath, 'utf-8');
    const parsed = parseToml(manifest);
    
    const deps = parsed.dependencies || {};
    const summary = Object.entries(deps)
      .map(([name, version]) => `- ${name}: ${version}`)
      .join('\n');
    
    return {
      content: [{
        type: 'text',
        text: `# Project Dependencies\n\n${summary}`
      }]
    };
  }
);
```

### E. Glossary

- **Agent**: AI-powered assistant in Kiro IDE that can understand and modify code
- **Agentic IDE**: IDE that integrates AI agents as first-class citizens
- **Context Window**: The amount of text/code that an AI model can process at once
- **EARS**: Easy Approach to Requirements Syntax, a structured format for writing requirements
- **Ground Truth**: Authoritative, verified information (as opposed to inferred or guessed)
- **Hallucination**: When AI generates false or nonsensical information
- **Injection Grammar**: Grammar rules that apply within embedded code blocks
- **LSP**: Language Server Protocol, standard for language intelligence features
- **MCP**: Model Context Protocol, standard for connecting AI to external data sources
- **Scope Name**: Identifier in TextMate grammar that categorizes a token type
- **SDD**: Spec-Driven Development, methodology of starting with formal specifications
- **Steering**: Mechanism for guiding AI behavior through configuration files
- **TextMate**: Grammar format used by VS Code and other editors
- **Token**: Smallest unit of code identified by the parser (keyword, identifier, etc.)
- **Vibe Coding**: Informal coding approach of trying random prompts until something works

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation
