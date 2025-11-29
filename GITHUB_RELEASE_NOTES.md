# 🚀 Project Extension Grammar v0.1.0 - Initial Release

## Overview

**Project Extension Grammar** is a comprehensive VS Code extension that provides 5-layer language support architecture for Kiro IDE, seamlessly integrating AI Agent capabilities with traditional IDE features.

## ✨ Features

### 🎨 Syntactic Layer
- TextMate grammar for syntax highlighting
- Standard scope names for theme compatibility
- Injection grammar for Markdown code blocks
- Auto-closing pairs and bracket matching

### 🧠 Semantic Layer
- Language Server Protocol (LSP) integration
- Go to definition and find references
- Hover information and IntelliSense
- Semantic token highlighting

### 📋 Steering Layer (Kiro IDE)
- AI guidance through steering files
- Conditional loading based on file patterns
- Project-specific coding rules
- Architecture documentation

### ⚡ Workflow Layer (Kiro IDE)
- Agent hooks for automation
- Event-driven triggers (onSave, onFileCreate)
- Recursion prevention
- Timeout enforcement

### 🔌 Contextual Layer (Kiro IDE)
- Model Context Protocol (MCP) integration
- Dynamic documentation fetching
- Dependency analysis
- Module scaffolding

## 📦 Installation

### Method 1: Install from VSIX (Recommended)

1. Download `project-extension-grammar-0.1.0.vsix` from this release
2. Open VS Code or Kiro IDE
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type "Install from VSIX"
5. Select the downloaded .vsix file
6. Restart your IDE

### Method 2: Manual Installation

```bash
# Using VS Code CLI
code --install-extension project-extension-grammar-0.1.0.vsix

# Or drag and drop the .vsix file into VS Code
```

## 🎯 Quick Start

1. **Create a .targetlang file**
   ```targetlang
   # Example code
   function greet(name: string) {
     print("Hello, " + name);
   }
   ```

2. **For Kiro IDE users - Initialize support:**
   - Press `Ctrl+Shift+P`
   - Run "Initialize Kiro Support"
   - This copies steering files and hooks to `.kiro/` folder

3. **Start coding with AI assistance!**

## 📊 Quality Metrics

- ✅ **260 tests passing** (100% pass rate)
- ✅ **25 test suites** (unit, property-based, integration, performance)
- ✅ **Package size**: 77.75 KB (optimized)
- ✅ **Activation time**: ~25ms
- ✅ **LSP response**: ~1ms

## 📚 Documentation

- [Installation Guide](INSTALLATION.md)
- [Quick Start](QUICK_START.md)
- [Configuration](docs/CONFIGURATION.md)
- [Examples](docs/EXAMPLES.md)
- [MCP Tools](docs/MCP_TOOLS.md)
- [Development Guide](DEVELOPMENT.md)

## 🔧 Requirements

- VS Code 1.80.0 or higher
- Kiro IDE (for AI features)
- Node.js 18+ (for development)

## 🐛 Known Issues

None at this time. Please report issues on GitHub.

## 🙏 Acknowledgments

Built with:
- TypeScript 5.0+
- VS Code Extension API
- fast-check (property-based testing)
- Jest (test runner)

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## 🔗 Links

- [GitHub Repository](https://github.com/intity01/project-extension-grammar)
- [Documentation](https://github.com/intity01/project-extension-grammar/tree/main/docs)
- [Report Issues](https://github.com/intity01/project-extension-grammar/issues)

---

**Full Changelog**: Initial release

**What's Next**: We're working on additional MCP tools and improved documentation. Stay tuned!
