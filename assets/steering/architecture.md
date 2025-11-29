---
inclusion: always
priority: 5
---

# Project Architecture

This file describes the project structure and architecture that the AI Agent should understand.

## Directory Structure

```
src/
├── extension.ts           # Main entry point
├── commands/              # Command implementations
├── syntactic/             # TextMate grammar layer
├── semantic/              # LSP integration layer
├── steering/              # Steering file management
├── workflow/              # Hook management
├── contextual/            # MCP integration
└── utils/                 # Utility functions
```

## Module Organization

- Each layer has its own directory
- Managers are responsible for lifecycle and coordination
- Utilities are shared across modules
