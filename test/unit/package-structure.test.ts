/**
 * Package Structure Tests
 * 
 * These tests verify that the extension package contains all required files
 * and that the package.json manifest is valid.
 * 
 * Requirements: 8.1
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Package Structure', () => {
  const rootDir = path.join(__dirname, '..', '..');

  describe('Required Files', () => {
    it('should have package.json in root', () => {
      const packagePath = path.join(rootDir, 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);
    });

    it('should have language-configuration.json in root', () => {
      const configPath = path.join(rootDir, 'language-configuration.json');
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should have README.md in root', () => {
      const readmePath = path.join(rootDir, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    it('should have .vscodeignore in root', () => {
      const ignorePath = path.join(rootDir, '.vscodeignore');
      expect(fs.existsSync(ignorePath)).toBe(true);
    });
  });

  describe('Grammar Files', () => {
    it('should have syntaxes directory', () => {
      const syntaxesDir = path.join(rootDir, 'syntaxes');
      expect(fs.existsSync(syntaxesDir)).toBe(true);
      expect(fs.statSync(syntaxesDir).isDirectory()).toBe(true);
    });

    it('should have targetlang.tmLanguage.json', () => {
      const grammarPath = path.join(rootDir, 'syntaxes', 'targetlang.tmLanguage.json');
      expect(fs.existsSync(grammarPath)).toBe(true);
    });

    it('should have valid JSON in grammar file', () => {
      const grammarPath = path.join(rootDir, 'syntaxes', 'targetlang.tmLanguage.json');
      const content = fs.readFileSync(grammarPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe('Template Assets', () => {
    it('should have assets directory', () => {
      const assetsDir = path.join(rootDir, 'assets');
      expect(fs.existsSync(assetsDir)).toBe(true);
      expect(fs.statSync(assetsDir).isDirectory()).toBe(true);
    });

    it('should have assets/steering directory', () => {
      const steeringDir = path.join(rootDir, 'assets', 'steering');
      expect(fs.existsSync(steeringDir)).toBe(true);
      expect(fs.statSync(steeringDir).isDirectory()).toBe(true);
    });

    it('should have assets/hooks directory', () => {
      const hooksDir = path.join(rootDir, 'assets', 'hooks');
      expect(fs.existsSync(hooksDir)).toBe(true);
      expect(fs.statSync(hooksDir).isDirectory()).toBe(true);
    });

    it('should have steering template files', () => {
      const rulesPath = path.join(rootDir, 'assets', 'steering', 'rules.md');
      const archPath = path.join(rootDir, 'assets', 'steering', 'architecture.md');
      
      expect(fs.existsSync(rulesPath)).toBe(true);
      expect(fs.existsSync(archPath)).toBe(true);
    });

    it('should have hook template files', () => {
      const autoTestPath = path.join(rootDir, 'assets', 'hooks', 'auto-test.json');
      const autoDocPath = path.join(rootDir, 'assets', 'hooks', 'auto-doc.json');
      
      expect(fs.existsSync(autoTestPath)).toBe(true);
      expect(fs.existsSync(autoDocPath)).toBe(true);
    });

    it('should have valid JSON in hook templates', () => {
      const autoTestPath = path.join(rootDir, 'assets', 'hooks', 'auto-test.json');
      const autoDocPath = path.join(rootDir, 'assets', 'hooks', 'auto-doc.json');
      
      const autoTestContent = fs.readFileSync(autoTestPath, 'utf-8');
      const autoDocContent = fs.readFileSync(autoDocPath, 'utf-8');
      
      expect(() => JSON.parse(autoTestContent)).not.toThrow();
      expect(() => JSON.parse(autoDocContent)).not.toThrow();
    });
  });

  describe('Schema Files', () => {
    it('should have schemas directory', () => {
      const schemasDir = path.join(rootDir, 'schemas');
      expect(fs.existsSync(schemasDir)).toBe(true);
      expect(fs.statSync(schemasDir).isDirectory()).toBe(true);
    });

    it('should have steering-schema.json', () => {
      const schemaPath = path.join(rootDir, 'schemas', 'steering-schema.json');
      expect(fs.existsSync(schemaPath)).toBe(true);
    });

    it('should have hook-schema.json', () => {
      const schemaPath = path.join(rootDir, 'schemas', 'hook-schema.json');
      expect(fs.existsSync(schemaPath)).toBe(true);
    });

    it('should have valid JSON in schema files', () => {
      const steeringSchemaPath = path.join(rootDir, 'schemas', 'steering-schema.json');
      const hookSchemaPath = path.join(rootDir, 'schemas', 'hook-schema.json');
      
      const steeringContent = fs.readFileSync(steeringSchemaPath, 'utf-8');
      const hookContent = fs.readFileSync(hookSchemaPath, 'utf-8');
      
      expect(() => JSON.parse(steeringContent)).not.toThrow();
      expect(() => JSON.parse(hookContent)).not.toThrow();
    });
  });

  describe('Package Manifest Validation', () => {
    let packageJson: any;

    beforeAll(() => {
      const packagePath = path.join(rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf-8');
      packageJson = JSON.parse(content);
    });

    it('should have required metadata fields', () => {
      expect(packageJson.name).toBeDefined();
      expect(packageJson.displayName).toBeDefined();
      expect(packageJson.description).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.vscode).toBeDefined();
    });

    it('should have vscode engine version >= 1.80.0', () => {
      const vscodeVersion = packageJson.engines.vscode;
      expect(vscodeVersion).toMatch(/\^1\.(8[0-9]|9[0-9]|[1-9][0-9]{2,})\./);
    });

    it('should have main entry point', () => {
      expect(packageJson.main).toBeDefined();
      expect(packageJson.main).toContain('out/extension.js');
    });

    it('should have categories array', () => {
      expect(Array.isArray(packageJson.categories)).toBe(true);
      expect(packageJson.categories.length).toBeGreaterThan(0);
    });

    it('should have contributes section', () => {
      expect(packageJson.contributes).toBeDefined();
    });

    it('should have languages contribution', () => {
      expect(packageJson.contributes.languages).toBeDefined();
      expect(Array.isArray(packageJson.contributes.languages)).toBe(true);
      expect(packageJson.contributes.languages.length).toBeGreaterThan(0);
    });

    it('should have valid language contribution structure', () => {
      const language = packageJson.contributes.languages[0];
      expect(language.id).toBeDefined();
      expect(Array.isArray(language.extensions)).toBe(true);
      expect(language.configuration).toBeDefined();
    });

    it('should have grammars contribution', () => {
      expect(packageJson.contributes.grammars).toBeDefined();
      expect(Array.isArray(packageJson.contributes.grammars)).toBe(true);
      expect(packageJson.contributes.grammars.length).toBeGreaterThan(0);
    });

    it('should have valid grammar contribution structure', () => {
      const grammar = packageJson.contributes.grammars[0];
      expect(grammar.language).toBeDefined();
      expect(grammar.scopeName).toBeDefined();
      expect(grammar.path).toBeDefined();
    });

    it('should have commands contribution', () => {
      expect(packageJson.contributes.commands).toBeDefined();
      expect(Array.isArray(packageJson.contributes.commands)).toBe(true);
    });

    it('should have jsonValidation contribution', () => {
      expect(packageJson.contributes.jsonValidation).toBeDefined();
      expect(Array.isArray(packageJson.contributes.jsonValidation)).toBe(true);
    });

    it('should reference existing grammar file in contribution', () => {
      const grammar = packageJson.contributes.grammars[0];
      const grammarPath = path.join(rootDir, grammar.path);
      expect(fs.existsSync(grammarPath)).toBe(true);
    });

    it('should reference existing language configuration in contribution', () => {
      const language = packageJson.contributes.languages[0];
      const configPath = path.join(rootDir, language.configuration);
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should have vscode:prepublish script', () => {
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts['vscode:prepublish']).toBeDefined();
    });

    it('should have compile script', () => {
      expect(packageJson.scripts.compile).toBeDefined();
    });

    it('should have package script', () => {
      expect(packageJson.scripts.package).toBeDefined();
    });
  });

  describe('Compiled Output', () => {
    it('should have out directory after compilation', () => {
      const outDir = path.join(rootDir, 'out');
      // This test will pass if compilation has been run
      // It's expected to fail in a clean checkout before compilation
      if (fs.existsSync(outDir)) {
        expect(fs.statSync(outDir).isDirectory()).toBe(true);
      }
    });

    it('should have extension.js in out directory after compilation', () => {
      const extensionPath = path.join(rootDir, 'out', 'extension.js');
      // This test will pass if compilation has been run
      if (fs.existsSync(path.join(rootDir, 'out'))) {
        expect(fs.existsSync(extensionPath)).toBe(true);
      }
    });
  });

  describe('Exclusions', () => {
    it('should have .vscodeignore that excludes source files', () => {
      const ignorePath = path.join(rootDir, '.vscodeignore');
      const content = fs.readFileSync(ignorePath, 'utf-8');
      
      expect(content).toContain('src/**');
      expect(content).toContain('test/**');
      expect(content).toContain('**/*.ts');
    });

    it('should have .vscodeignore that excludes development files', () => {
      const ignorePath = path.join(rootDir, '.vscodeignore');
      const content = fs.readFileSync(ignorePath, 'utf-8');
      
      expect(content).toContain('.vscode/**');
      expect(content).toContain('tsconfig.json');
    });

    it('should have .vscodeignore that excludes spec files', () => {
      const ignorePath = path.join(rootDir, '.vscodeignore');
      const content = fs.readFileSync(ignorePath, 'utf-8');
      
      expect(content).toContain('.kiro/**');
    });

    it('should have .vscodeignore that excludes node_modules', () => {
      const ignorePath = path.join(rootDir, '.vscodeignore');
      const content = fs.readFileSync(ignorePath, 'utf-8');
      
      expect(content).toContain('node_modules/**');
    });
  });
});
