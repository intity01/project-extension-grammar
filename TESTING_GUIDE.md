# 🧪 Testing Guide - Project Extension Grammar

## 📋 Pre-Testing Checklist

Before you start testing, make sure you have:
- ✅ VS Code or Kiro IDE installed (version 1.80.0 or higher)
- ✅ The VSIX file: `project-extension-grammar-0.1.0.vsix`
- ✅ A test project folder ready

---

## 🚀 Step-by-Step Testing Instructions

### Step 1: Install the Extension

1. **Open VS Code or Kiro IDE**
   ```
   Launch your IDE
   ```

2. **Open Extensions View**
   ```
   Press: Ctrl+Shift+X (Windows/Linux)
   Or: Cmd+Shift+X (Mac)
   ```

3. **Install from VSIX**
   ```
   - Click the "..." menu (three dots) at the top of Extensions view
   - Select "Install from VSIX..."
   - Navigate to: project-extension-grammar-0.1.0.vsix
   - Click "Install"
   ```

4. **Restart IDE**
   ```
   - Close and reopen VS Code/Kiro IDE
   - Or press: Ctrl+Shift+P → "Reload Window"
   ```

5. **Verify Installation**
   ```
   - Open Extensions view (Ctrl+Shift+X)
   - Search for "Project Extension Grammar"
   - Should show as installed ✅
   ```

---

### Step 2: Test Basic Features

#### Test 2.1: Syntax Highlighting

1. **Create a test file**
   ```
   - Create new file: test.targetlang
   - Or use the provided: example.targetlang
   ```

2. **Add sample code**
   ```targetlang
   // Test comment
   function hello() {
       let message = "Hello, World!";
       print(message);
   }
   
   class TestClass {
       constructor() {
           this.value = 42;
       }
   }
   ```

3. **Verify syntax highlighting**
   - ✅ Comments should be colored (gray/green)
   - ✅ Keywords (function, class, let) should be highlighted
   - ✅ Strings should be colored (orange/red)
   - ✅ Numbers should be highlighted
   - ✅ Function/class names should be distinct

**Expected Result**: All syntax elements should have different colors

---

#### Test 2.2: Language Configuration

1. **Test comment toggling**
   ```
   - Place cursor on a line
   - Press: Ctrl+/ (Windows/Linux) or Cmd+/ (Mac)
   - Line should get // comment
   - Press again to uncomment
   ```

2. **Test bracket matching**
   ```
   - Type: function test() {
   - Closing } should auto-complete
   - Click on { or } - matching bracket should highlight
   ```

3. **Test auto-closing pairs**
   ```
   - Type: "hello
   - Closing " should auto-complete
   - Same for: (), [], {}
   ```

**Expected Result**: All auto-completion and matching should work

---

#### Test 2.3: Code Folding

1. **Create foldable code**
   ```targetlang
   function longFunction() {
       let a = 1;
       let b = 2;
       let c = 3;
       return a + b + c;
   }
   ```

2. **Test folding**
   ```
   - Hover over line numbers
   - Click the fold icon (▼)
   - Function body should collapse
   - Click again to expand
   ```

**Expected Result**: Code blocks should fold/unfold correctly

---

### Step 3: Test Kiro IDE Features (Kiro IDE Only)

#### Test 3.1: Initialize Kiro Support

1. **Run initialization command**
   ```
   - Press: Ctrl+Shift+P
   - Type: "Initialize Kiro Support"
   - Press Enter
   ```

2. **Verify files created**
   ```
   Check that these files exist:
   .kiro/
   ├── steering/
   │   ├── rules.md
   │   └── architecture.md
   └── hooks/
       ├── auto-test.json
       └── auto-doc.json
   ```

3. **Check file contents**
   ```
   - Open .kiro/steering/rules.md
   - Should contain template content
   - Open .kiro/hooks/auto-test.json
   - Should contain valid JSON
   ```

**Expected Result**: All template files created successfully

---

#### Test 3.2: Steering Files

1. **Edit steering file**
   ```markdown
   # .kiro/steering/rules.md
   ---
   inclusion: always
   ---
   
   # Test Rules
   - Use camelCase for variables
   - Add comments for functions
   ```

2. **Test conditional loading**
   ```markdown
   # .kiro/steering/test-specific.md
   ---
   inclusion: fileMatch
   fileMatchPattern: "**/*.targetlang"
   ---
   
   # Language-specific rules
   - Follow targetlang conventions
   ```

3. **Verify loading** (in Kiro IDE)
   ```
   - Open a .targetlang file
   - Steering rules should be active
   - Ask AI to generate code
   - Should follow the rules
   ```

**Expected Result**: Steering files load based on patterns

---

#### Test 3.3: Agent Hooks

1. **Configure a test hook**
   ```json
   {
     "name": "Test Hook",
     "trigger": {
       "type": "onSave",
       "filePattern": "**/*.targetlang"
     },
     "action": {
       "type": "prompt",
       "prompt": "Check this file for syntax errors"
     },
     "enabled": true
   }
   ```

2. **Test hook trigger**
   ```
   - Open a .targetlang file
   - Make a change
   - Save the file (Ctrl+S)
   - Hook should trigger
   ```

3. **Verify hook execution**
   ```
   - Check Output panel
   - Should show hook execution
   - AI should respond to prompt
   ```

**Expected Result**: Hooks trigger on specified events

---

### Step 4: Test Advanced Features

#### Test 4.1: Multiple Files

1. **Create multiple test files**
   ```
   test1.targetlang
   test2.targetlang
   test3.tlang
   ```

2. **Verify all files work**
   ```
   - Open each file
   - Check syntax highlighting
   - Test features in each
   ```

**Expected Result**: All .targetlang and .tlang files work

---

#### Test 4.2: Large Files

1. **Create a large file**
   ```
   - Copy example.targetlang
   - Duplicate content 10-20 times
   - Save as large-test.targetlang
   ```

2. **Test performance**
   ```
   - Open the large file
   - Scroll through it
   - Edit some lines
   - Check responsiveness
   ```

**Expected Result**: No lag or performance issues

---

#### Test 4.3: Error Handling

1. **Test with invalid syntax**
   ```targetlang
   // Invalid code
   function {
       let = ;
       class
   ```

2. **Verify graceful handling**
   ```
   - File should still open
   - Highlighting should work
   - No crashes or errors
   ```

**Expected Result**: Extension handles errors gracefully

---

### Step 5: Configuration Testing

#### Test 5.1: Extension Settings

1. **Open settings**
   ```
   - Press: Ctrl+, (Windows/Linux) or Cmd+, (Mac)
   - Search: "Project Extension Grammar"
   ```

2. **Verify settings exist**
   ```
   ✅ LSP Enabled
   ✅ LSP Server Path
   ✅ Steering Auto Load
   ✅ Hooks Enabled
   ✅ MCP Enabled
   ```

3. **Test toggling settings**
   ```
   - Disable "Hooks Enabled"
   - Reload window
   - Hooks should not trigger
   - Re-enable and test again
   ```

**Expected Result**: All settings work as expected

---

## 📊 Test Results Checklist

Mark each test as you complete it:

### Basic Features
- [ ] Extension installs successfully
- [ ] Syntax highlighting works
- [ ] Comment toggling works (Ctrl+/)
- [ ] Bracket matching works
- [ ] Auto-closing pairs work
- [ ] Code folding works
- [ ] Multiple file extensions work (.targetlang, .tlang)

### Kiro IDE Features (Kiro IDE only)
- [ ] Initialize command works
- [ ] Template files created
- [ ] Steering files load
- [ ] Conditional loading works
- [ ] Hooks trigger correctly
- [ ] Hook actions execute

### Advanced Features
- [ ] Large files perform well
- [ ] Error handling is graceful
- [ ] Settings are accessible
- [ ] Settings changes take effect

### Performance
- [ ] Extension activates quickly (< 2s)
- [ ] No lag when editing
- [ ] No memory leaks
- [ ] Smooth scrolling in large files

---

## 🐛 Troubleshooting

### Extension Not Activating

**Problem**: Extension doesn't activate when opening .targetlang files

**Solutions**:
1. Check file extension is correct (.targetlang or .tlang)
2. Reload window: Ctrl+Shift+P → "Reload Window"
3. Check Output panel: View → Output → "Project Extension Grammar"
4. Reinstall extension

---

### No Syntax Highlighting

**Problem**: Code appears as plain text

**Solutions**:
1. Verify file extension is .targetlang or .tlang
2. Check language mode in status bar (bottom right)
3. Manually set language: Click language mode → Select "Target Language"
4. Try different color theme: File → Preferences → Color Theme

---

### Hooks Not Working (Kiro IDE)

**Problem**: Hooks don't trigger on save

**Solutions**:
1. Check hooks are enabled in settings
2. Verify hook JSON syntax is valid
3. Check file pattern matches your files
4. Look for errors in Output panel
5. Restart IDE

---

### Steering Files Not Loading (Kiro IDE)

**Problem**: AI doesn't follow steering rules

**Solutions**:
1. Verify files exist in .kiro/steering/
2. Check frontmatter syntax (YAML between ---)
3. Enable "Steering Auto Load" in settings
4. Verify fileMatchPattern is correct
5. Check Output panel for errors

---

## 📝 Reporting Issues

If you find bugs or issues:

1. **Collect information**:
   - Extension version: 0.1.0
   - VS Code/Kiro version: (Help → About)
   - Operating system
   - Error messages from Output panel

2. **Steps to reproduce**:
   - What you did
   - What you expected
   - What actually happened

3. **Screenshots**:
   - Take screenshots of the issue
   - Include Output panel if relevant

4. **Report**:
   - Open GitHub issue (if public)
   - Or contact maintainers

---

## ✅ Success Criteria

The extension is working correctly if:

✅ All basic features work (syntax highlighting, comments, brackets)
✅ Extension activates quickly (< 2 seconds)
✅ No errors in Output panel
✅ Performance is smooth with large files
✅ Kiro IDE features work (if using Kiro IDE)
✅ Settings can be changed and take effect

---

## 🎉 Next Steps After Testing

Once testing is complete:

1. **If all tests pass**:
   - Extension is ready for production use
   - Can be deployed to marketplace
   - Share with team/users

2. **If issues found**:
   - Document all issues
   - Prioritize by severity
   - Fix critical issues first
   - Re-test after fixes

3. **Feedback**:
   - Collect user feedback
   - Note feature requests
   - Plan improvements

---

**Happy Testing!** 🚀

If you need help, refer to:
- [INSTALLATION.md](INSTALLATION.md) - Installation guide
- [README.md](README.md) - Feature overview
- [CONFIGURATION.md](docs/CONFIGURATION.md) - Configuration details
- [EXAMPLES.md](docs/EXAMPLES.md) - Usage examples
