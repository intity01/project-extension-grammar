import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Feature: project-extension-grammar, Property 7: Package Manifest Completeness
describe('Property 7: Package Manifest Completeness', () => {

  let packageJson: any;

  beforeAll(() => {
    const packagePath = path.join(__dirname, '../../package.json');
    const content = fs.readFileSync(packagePath, 'utf-8');
    packageJson = JSON.parse(content);
  });

  it('should have all required metadata fields', () => {
    expect(packageJson.name).toBeDefined();
    expect(packageJson.displayName).toBeDefined();
    expect(packageJson.description).toBeDefined();
    expect(packageJson.version).toBeDefined();
    expect(packageJson.publisher).toBeDefined();
  });

  it('should have engines.vscode >= 1.80.0', () => {
    expect(packageJson.engines).toBeDefined();
    expect(packageJson.engines.vscode).toBeDefined();
    expect(packageJson.engines.vscode).toMatch(/\^1\.(8[0-9]|9[0-9]|[1-9][0-9]{2,})\./);
  });

  it('should have categories array', () => {
    expect(packageJson.categories).toBeDefined();
    expect(Array.isArray(packageJson.categories)).toBe(true);
    expect(packageJson.categories.length).toBeGreaterThan(0);
  });

  it('should have contributes.languages with required fields', () => {
    expect(packageJson.contributes).toBeDefined();
    expect(packageJson.contributes.languages).toBeDefined();
    expect(Array.isArray(packageJson.contributes.languages)).toBe(true);
    
    if (packageJson.contributes.languages.length > 0) {
      const lang = packageJson.contributes.languages[0];
      expect(lang.id).toBeDefined();
      expect(lang.extensions).toBeDefined();
      expect(Array.isArray(lang.extensions)).toBe(true);
      expect(lang.configuration).toBeDefined();
    }
  });

  it('should have contributes.grammars with required fields', () => {
    expect(packageJson.contributes.grammars).toBeDefined();
    expect(Array.isArray(packageJson.contributes.grammars)).toBe(true);
    
    if (packageJson.contributes.grammars.length > 0) {
      const grammar = packageJson.contributes.grammars[0];
      expect(grammar.language).toBeDefined();
      expect(grammar.scopeName).toBeDefined();
      expect(grammar.path).toBeDefined();
    }
  });

  it('should have contributes.commands array', () => {
    expect(packageJson.contributes.commands).toBeDefined();
    expect(Array.isArray(packageJson.contributes.commands)).toBe(true);
  });

  it('should have main entry point', () => {
    expect(packageJson.main).toBeDefined();
    expect(typeof packageJson.main).toBe('string');
  });

  it('should have activation events', () => {
    expect(packageJson.activationEvents).toBeDefined();
    expect(Array.isArray(packageJson.activationEvents)).toBe(true);
  });

  it('should maintain consistency across multiple reads', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (readCount) => {
          const packagePath = path.join(__dirname, '../../package.json');
          
          const results = [];
          for (let i = 0; i < readCount; i++) {
            const content = fs.readFileSync(packagePath, 'utf-8');
            const parsed = JSON.parse(content);
            results.push({
              name: parsed.name,
              version: parsed.version,
              hasLanguages: parsed.contributes?.languages?.length > 0,
              hasGrammars: parsed.contributes?.grammars?.length > 0
            });
          }

          // All reads should return the same data
          for (let i = 1; i < results.length; i++) {
            expect(results[i]).toEqual(results[0]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid JSON structure', () => {
    fc.assert(
      fc.property(
        fc.constant(packageJson),
        (pkg) => {
          // Should be able to stringify and parse without errors
          const stringified = JSON.stringify(pkg);
          const parsed = JSON.parse(stringified);
          
          expect(parsed.name).toBe(pkg.name);
          expect(parsed.version).toBe(pkg.version);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have language and grammar in sync', () => {
    if (packageJson.contributes.languages.length > 0 && 
        packageJson.contributes.grammars.length > 0) {
      
      const languageIds = packageJson.contributes.languages.map((l: any) => l.id);
      const grammarLanguages = packageJson.contributes.grammars.map((g: any) => g.language);
      
      // Every grammar should reference a defined language
      for (const grammarLang of grammarLanguages) {
        expect(languageIds).toContain(grammarLang);
      }
    }
  });

  it('should have valid file paths in configuration', () => {
    const rootDir = path.join(__dirname, '../..');
    
    // Check language configuration path
    if (packageJson.contributes.languages.length > 0) {
      const lang = packageJson.contributes.languages[0];
      if (lang.configuration) {
        const configPath = path.join(rootDir, lang.configuration);
        expect(fs.existsSync(configPath)).toBe(true);
      }
    }
    
    // Check grammar path
    if (packageJson.contributes.grammars.length > 0) {
      const grammar = packageJson.contributes.grammars[0];
      if (grammar.path) {
        const grammarPath = path.join(rootDir, grammar.path);
        expect(fs.existsSync(grammarPath)).toBe(true);
      }
    }
  });
});
