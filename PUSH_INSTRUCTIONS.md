# 🚀 Git Push Instructions

## ⚡ Quick Push Guide

### Step 1: Create Remote Repository

Choose one platform:

#### Option A: GitHub (Recommended)
1. Go to: https://github.com/new
2. Repository name: `project-extension-grammar`
3. Description: `VS Code/Kiro IDE extension for language support with AI integration`
4. Visibility: **Public** or **Private** (your choice)
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click "Create repository"

#### Option B: GitLab
1. Go to: https://gitlab.com/projects/new
2. Project name: `project-extension-grammar`
3. Visibility: **Public** or **Private**
4. **DO NOT** check "Initialize with README"
5. Click "Create project"

---

### Step 2: Copy Repository URL

After creating, you'll see a URL like:
- GitHub: `https://github.com/YOUR_USERNAME/project-extension-grammar.git`
- GitLab: `https://gitlab.com/YOUR_USERNAME/project-extension-grammar.git`

**Copy this URL!**

---

### Step 3: Add Remote and Push

Run these commands (replace `YOUR_REPO_URL` with your actual URL):

```bash
# Add remote
git remote add origin YOUR_REPO_URL

# Rename branch to main (optional, modern convention)
git branch -M main

# Push code
git push -u origin main

# Push tags
git push origin --tags
```

---

## 📋 Complete Command Examples

### For GitHub:
```bash
# Example (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/project-extension-grammar.git
git branch -M main
git push -u origin main
git push origin --tags
```

### For GitLab:
```bash
# Example (replace YOUR_USERNAME)
git remote add origin https://gitlab.com/YOUR_USERNAME/project-extension-grammar.git
git branch -M main
git push -u origin main
git push origin --tags
```

---

## ✅ Verification

After pushing, verify:

1. **Check repository online**
   - Go to your repository URL
   - Should see all files
   - Should see 2 commits
   - Should see tag v0.1.0

2. **Check locally**
   ```bash
   git remote -v
   git log --oneline
   git tag
   ```

---

## 🎯 What Gets Pushed

### Files (90 files):
- ✅ Source code (src/)
- ✅ Tests (test/)
- ✅ Documentation (*.md)
- ✅ Assets (assets/)
- ✅ Configuration files
- ✅ Example files

### Excluded (in .gitignore):
- ❌ node_modules/
- ❌ out/ (compiled files)
- ❌ *.vsix (package)
- ❌ coverage/
- ❌ .vscode-test/

### Commits:
- ✅ Initial commit (90 files)
- ✅ Documentation commit

### Tags:
- ✅ v0.1.0

---

## 🐛 Troubleshooting

### Error: "remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin YOUR_REPO_URL
```

### Error: "failed to push"
```bash
# Check remote URL
git remote -v

# Try force push (careful!)
git push -u origin main --force
```

### Error: "authentication failed"
```bash
# For HTTPS: Use personal access token instead of password
# For SSH: Set up SSH keys

# Or use GitHub CLI
gh auth login
```

---

## 🔐 Authentication Options

### Option 1: HTTPS with Personal Access Token (Recommended)

**GitHub:**
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Copy token
5. Use token as password when pushing

**GitLab:**
1. Go to: https://gitlab.com/-/profile/personal_access_tokens
2. Create token with `write_repository` scope
3. Use token as password

### Option 2: SSH Keys

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub/GitLab settings
# Then use SSH URL instead of HTTPS
```

### Option 3: GitHub CLI (Easiest)

```bash
# Install GitHub CLI
# Windows: winget install GitHub.cli

# Login
gh auth login

# Push will work automatically
```

---

## 📦 After Pushing

### Create GitHub Release (Optional)

1. Go to: `https://github.com/YOUR_USERNAME/project-extension-grammar/releases`
2. Click "Create a new release"
3. Choose tag: `v0.1.0`
4. Release title: `v0.1.0 - Initial Release`
5. Upload: `project-extension-grammar-0.1.0.vsix`
6. Click "Publish release"

### Update Repository Settings

1. **Add description**
2. **Add topics/tags**: `vscode-extension`, `kiro-ide`, `language-support`, `ai-integration`
3. **Add README badges** (optional)
4. **Enable Issues** (if you want bug reports)
5. **Add LICENSE** (already included)

---

## 🎉 Success!

After successful push, your repository will be:
- ✅ Publicly/privately accessible
- ✅ Version controlled
- ✅ Ready for collaboration
- ✅ Backed up in the cloud

---

## 🚀 Ready to Push?

**Current status:**
- Repository: Initialized ✅
- Commits: 2 ✅
- Tags: v0.1.0 ✅
- Remote: Not added yet ⏳

**Next step:** Create remote repository and run push commands above!

---

Need help? Just ask! 🤝
