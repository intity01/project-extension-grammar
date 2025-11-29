# Release Checklist

This checklist ensures that all necessary steps are completed before releasing a new version of the Project Extension Grammar extension.

## Pre-Release Verification

### Code Quality
- [ ] All unit tests pass (`npm test`)
- [ ] All property-based tests pass with 100+ iterations
- [ ] All integration tests pass
- [ ] Code coverage meets target (80%+)
- [ ] No TypeScript compilation errors (`npm run compile`)
- [ ] No linting errors

### Documentation
- [ ] README.md is up to date with latest features
- [ ] CHANGELOG.md includes all changes for this version
- [ ] All configuration options are documented
- [ ] Examples are current and working
- [ ] API documentation is complete (if applicable)

### Package Structure
- [ ] Run `npm run package` successfully
- [ ] Verify .vsix file is created
- [ ] Extract and inspect .vsix contents (see Package Contents section below)
- [ ] All template files are included in assets/
- [ ] All schema files are included in schemas/
- [ ] Grammar files are included in syntaxes/
- [ ] language-configuration.json is included
- [ ] Compiled JavaScript is in out/ directory

### Functionality Testing
- [ ] Install extension from .vsix in clean Kiro IDE instance
- [ ] Test syntax highlighting on sample files
- [ ] Test `Initialize Kiro Support` command
- [ ] Verify steering files are copied correctly
- [ ] Verify hook files are copied correctly
- [ ] Test LSP integration (if applicable)
- [ ] Test MCP server integration (if applicable)
- [ ] Test all configuration settings

### Version Management
- [ ] Update version number in package.json
- [ ] Update CHANGELOG.md with release date
- [ ] Create git tag for release version
- [ ] Ensure all changes are committed

## Package Contents Verification

After running `npm run package`, extract the .vsix file and verify it contains:

### Required Files
- [ ] `extension/package.json` - Extension manifest
- [ ] `extension/language-configuration.json` - Language configuration
- [ ] `extension/README.md` - User documentation

### Compiled Code
- [ ] `extension/out/extension.js` - Main extension entry point
- [ ] `extension/out/**/*.js` - All compiled TypeScript files

### Grammar Files
- [ ] `extension/syntaxes/targetlang.tmLanguage.json` - TextMate grammar

### Template Assets
- [ ] `extension/assets/steering/rules.md` - Coding standards template
- [ ] `extension/assets/steering/architecture.md` - Architecture template
- [ ] `extension/assets/hooks/auto-test.json` - Test automation template
- [ ] `extension/assets/hooks/auto-doc.json` - Documentation template

### Schema Files
- [ ] `extension/schemas/steering-schema.json` - Steering file validation schema
- [ ] `extension/schemas/hook-schema.json` - Hook configuration validation schema

### Should NOT Include
- [ ] Source TypeScript files (src/**/*.ts)
- [ ] Test files (test/**/*.ts)
- [ ] Development configuration (.vscode/, tsconfig.json)
- [ ] Spec files (.kiro/**)
- [ ] node_modules/
- [ ] DEVELOPMENT.md

## Distribution

### OpenVSX / VS Code Marketplace
- [ ] Test installation from marketplace in clean environment
- [ ] Verify extension page displays correctly
- [ ] Check that all metadata is correct (name, description, categories)
- [ ] Verify icon and screenshots are displayed

### Manual Distribution
- [ ] .vsix file is available for download
- [ ] Installation instructions are clear
- [ ] System requirements are documented

## Post-Release
- [ ] Monitor for installation issues
- [ ] Check for error reports
- [ ] Verify telemetry (if applicable)
- [ ] Update documentation site (if applicable)
- [ ] Announce release (if applicable)

## Rollback Plan
In case of critical issues:
- [ ] Previous version .vsix is available
- [ ] Rollback procedure is documented
- [ ] Users can be notified of issues

## Notes
- Always test in a clean environment before releasing
- Keep previous version available for rollback
- Document any known issues in release notes
- Consider beta testing for major releases
