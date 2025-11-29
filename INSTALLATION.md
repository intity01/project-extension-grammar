# Installation Guide

## 📦 Installing the Extension

### Method 1: Install from VSIX (Recommended)

1. **Locate the VSIX file**
   ```
   project-extension-grammar-0.1.0.vsix
   ```

2. **Install in VS Code/Kiro IDE**
   - Open VS Code or Kiro IDE
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Install from VSIX"
   - Select the `.vsix` file
   - Restart the IDE

3. **Verify Installation**
   - Open a `.targetlang` or `.tlang` file
   - You should see syntax highlighting
   - Check Extensions view (`Ctrl+Shift+X`) for "Project Extension Grammar"

### Method 2: Install from Source

```bash
# 1. Clone or navigate to the project
cd project-extension-grammar

# 2. Install dependencies
npm install

# 3. Compile the extension
npm run compile

# 4. Package the extension
npm run package

# 5. Install the generated .vsix file (see Method 1)
```

## 🚀 Quick Start

### 1. Initialize Kiro Support

After installing the extension, initialize Kiro support in your project:

1. Open your project in VS Code/Kiro IDE
2. Press `Ctrl+Shift+P` and run: **"Initialize Kiro Support"**
3. This will create:
   ```
   .kiro/
   ├── steering/
   │   ├── rules.md
   │   └── architecture.md
   └── hooks/
       ├── auto-test.json
       └── auto-doc.json
   ```

### 2. Create a Test File

Create a file with `.targetlang` or `.tlang` extension:

```targetlang
// test.targetlang
function hello() {
    print("Hello, World!");
}

class MyClass {
    constructor() {
        this.value = 42;
    }
}
```

You should see:
- ✅ Syntax highlighting
- ✅ Bracket matching
- ✅ Auto-completion
- ✅ Code folding

### 3. Configure Steering Rules (Kiro IDE only)

Edit `.kiro/steering/rules.md` to define coding standards:

```markdown
---
inclusion: always
---

# Coding Standards

## Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_CASE for constants

## Best Practices
- Always add comments for complex logic
- Keep functions under 50 lines
- Use meaningful variable names
```

### 4. Set Up Hooks (Kiro IDE only)

Edit `.kiro/hooks/auto-test.json` to automate testing:

```json
{
  "name": "Auto Test on Save",
  "trigger": {
    "type": "onSave",
    "filePattern": "**/*.targetlang"
  },
  "action": {
    "type": "prompt",
    "prompt": "Run tests for this file and report any issues"
  },
  "enabled": true
}
```

## ⚙️ Configuration

### Extension Settings

Access via: `File > Preferences > Settings` → Search "Project Extension Grammar"

- **LSP Enabled**: Enable Language Server Protocol integration
- **LSP Server Path**: Custom path to language server (optional)
- **Steering Auto Load**: Automatically load steering files
- **Hooks Enabled**: Enable agent hooks
- **MCP Enabled**: Enable Model Context Protocol

### Language Configuration

The extension automatically configures:
- Comment syntax: `//` for line comments, `/* */` for block comments
- Bracket pairs: `()`, `[]`, `{}`
- Auto-closing pairs
- Word patterns for selection

## 🔧 Troubleshooting

### Extension Not Activating

1. Check if file extension is correct (`.targetlang` or `.tlang`)
2. Reload window: `Ctrl+Shift+P` → "Reload Window"
3. Check Output panel: `View > Output` → Select "Project Extension Grammar"

### Syntax Highlighting Not Working

1. Verify the grammar file exists: `syntaxes/targetlang.tmLanguage.json`
2. Check language configuration: `language-configuration.json`
3. Try changing color theme: `File > Preferences > Color Theme`

### Steering Files Not Loading (Kiro IDE)

1. Verify files exist in `.kiro/steering/`
2. Check frontmatter syntax in steering files
3. Enable auto-load in settings
4. Check file match patterns

### Hooks Not Triggering (Kiro IDE)

1. Verify hooks are enabled in settings
2. Check hook configuration JSON syntax
3. Verify file patterns match your files
4. Check Output panel for errors

## 📚 Next Steps

- Read [CONFIGURATION.md](docs/CONFIGURATION.md) for detailed settings
- See [EXAMPLES.md](docs/EXAMPLES.md) for usage examples
- Check [MCP_TOOLS.md](docs/MCP_TOOLS.md) for MCP integration
- Review [DEVELOPMENT.md](DEVELOPMENT.md) for contributing

## 🆘 Support

If you encounter issues:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review the Output panel for error messages
3. Open an issue on GitHub with:
   - Extension version
   - VS Code/Kiro version
   - Error messages
   - Steps to reproduce

## 📄 License

This extension is licensed under the MIT License. See [LICENSE](LICENSE) for details.
