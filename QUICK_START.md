# 🚀 Quick Start Guide

## ⚡ 5-Minute Installation & Test

### Step 1: Install (2 minutes)

1. **Open VS Code or Kiro IDE**

2. **Install Extension**
   - Press `Ctrl+Shift+X` (Extensions view)
   - Click `...` (three dots menu)
   - Select "Install from VSIX..."
   - Choose: `project-extension-grammar-0.1.0.vsix`
   - Click "Install"

3. **Reload Window**
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - Press Enter

✅ **Installation Complete!**

---

### Step 2: Test (3 minutes)

#### Test 1: Open Example File (30 seconds)

```bash
# Open the example file
File → Open File → example.targetlang
```

**What to check:**
- ✅ Code has colors (syntax highlighting)
- ✅ Comments are gray/green
- ✅ Keywords are highlighted
- ✅ Strings are colored

---

#### Test 2: Try Features (1 minute)

**Comment Toggle:**
```
1. Click on any line
2. Press Ctrl+/ (Windows/Linux) or Cmd+/ (Mac)
3. Line should get // comment
```

**Bracket Matching:**
```
1. Type: function test() {
2. Closing } should auto-complete
3. Click on { - matching } should highlight
```

**Auto-Closing:**
```
1. Type: "hello
2. Closing " should auto-complete
```

---

#### Test 3: Create Your Own File (1.5 minutes)

1. **Create new file**
   ```
   File → New File
   Save as: test.targetlang
   ```

2. **Type some code**
   ```targetlang
   // My first test
   function greet(name) {
       let message = "Hello, " + name;
       print(message);
   }
   
   class Person {
       constructor(name) {
           this.name = name;
       }
   }
   ```

3. **Verify it works**
   - ✅ Syntax highlighting active
   - ✅ Auto-completion works
   - ✅ Brackets match

---

### Step 3: Kiro IDE Features (Optional - Kiro IDE only)

#### Initialize Kiro Support (1 minute)

1. **Run command**
   ```
   Press: Ctrl+Shift+P
   Type: "Initialize Kiro Support"
   Press: Enter
   ```

2. **Check files created**
   ```
   .kiro/
   ├── steering/
   │   ├── rules.md
   │   └── architecture.md
   └── hooks/
       ├── auto-test.json
       └── auto-doc.json
   ```

3. **Edit steering rules**
   ```markdown
   # .kiro/steering/rules.md
   ---
   inclusion: always
   ---
   
   # My Coding Rules
   - Use camelCase for variables
   - Add comments for functions
   - Keep functions under 50 lines
   ```

✅ **AI will now follow your rules!**

---

## ✅ Success Checklist

After 5 minutes, you should have:

- [x] Extension installed
- [x] Syntax highlighting working
- [x] Auto-completion working
- [x] Bracket matching working
- [x] Example file opened and tested
- [x] Created your own .targetlang file
- [x] (Kiro IDE) Initialized Kiro support

---

## 🎯 What's Next?

### For Basic Users:
- Start coding in .targetlang files
- Enjoy syntax highlighting and auto-completion
- Use comment toggle (Ctrl+/)

### For Kiro IDE Users:
- Customize steering files for your project
- Set up hooks for automation
- Let AI help with your coding

### For Advanced Users:
- Read [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive tests
- Check [CONFIGURATION.md](docs/CONFIGURATION.md) for settings
- See [EXAMPLES.md](docs/EXAMPLES.md) for more examples

---

## 🐛 Quick Troubleshooting

### Extension not working?
```
1. Check file extension is .targetlang or .tlang
2. Reload window: Ctrl+Shift+P → "Reload Window"
3. Check Output panel: View → Output → "Project Extension Grammar"
```

### No syntax highlighting?
```
1. Click language mode (bottom right)
2. Select "Target Language"
3. Try different color theme
```

### Need help?
```
- Read: INSTALLATION.md
- Read: TESTING_GUIDE.md
- Check: Output panel for errors
```

---

## 📚 Documentation

- **[README.md](README.md)** - Overview and features
- **[INSTALLATION.md](INSTALLATION.md)** - Detailed installation
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project details
- **[CONFIGURATION.md](docs/CONFIGURATION.md)** - Settings guide

---

**Enjoy coding with Project Extension Grammar!** 🎉

**Time to complete**: ⏱️ 5 minutes
**Difficulty**: 🟢 Easy
**Status**: ✅ Ready to use
