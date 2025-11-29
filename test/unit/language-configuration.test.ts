import * as fs from 'fs';
import * as path from 'path';

describe('Language Configuration', () => {
  let languageConfig: any;

  beforeAll(() => {
    const configPath = path.join(__dirname, '../../language-configuration.json');
    const content = fs.readFileSync(configPath, 'utf-8');
    languageConfig = JSON.parse(content);
  });

  describe('Comment Syntax', () => {
    it('should define line comment syntax', () => {
      expect(languageConfig.comments).toBeDefined();
      expect(languageConfig.comments.lineComment).toBeDefined();
      expect(typeof languageConfig.comments.lineComment).toBe('string');
    });

    it('should define block comment syntax', () => {
      expect(languageConfig.comments).toBeDefined();
      expect(languageConfig.comments.blockComment).toBeDefined();
      expect(Array.isArray(languageConfig.comments.blockComment)).toBe(true);
      expect(languageConfig.comments.blockComment).toHaveLength(2);
    });

    it('should have valid comment syntax format', () => {
      expect(languageConfig.comments.lineComment).toBe('//');
      expect(languageConfig.comments.blockComment[0]).toBe('/*');
      expect(languageConfig.comments.blockComment[1]).toBe('*/');
    });
  });

  describe('Bracket Rules', () => {
    it('should define bracket pairs', () => {
      expect(languageConfig.brackets).toBeDefined();
      expect(Array.isArray(languageConfig.brackets)).toBe(true);
      expect(languageConfig.brackets.length).toBeGreaterThan(0);
    });

    it('should include common bracket types', () => {
      const bracketStrings = languageConfig.brackets.map((pair: any[]) => pair.join(''));
      expect(bracketStrings).toContain('{}');
      expect(bracketStrings).toContain('[]');
      expect(bracketStrings).toContain('()');
    });

    it('should have valid bracket pair format', () => {
      languageConfig.brackets.forEach((pair: any) => {
        expect(Array.isArray(pair)).toBe(true);
        expect(pair).toHaveLength(2);
        expect(typeof pair[0]).toBe('string');
        expect(typeof pair[1]).toBe('string');
      });
    });
  });

  describe('Auto-Closing Pairs', () => {
    it('should define auto-closing pairs', () => {
      expect(languageConfig.autoClosingPairs).toBeDefined();
      expect(Array.isArray(languageConfig.autoClosingPairs)).toBe(true);
      expect(languageConfig.autoClosingPairs.length).toBeGreaterThan(0);
    });

    it('should have valid auto-closing pair format', () => {
      languageConfig.autoClosingPairs.forEach((pair: any) => {
        expect(pair.open).toBeDefined();
        expect(pair.close).toBeDefined();
        expect(typeof pair.open).toBe('string');
        expect(typeof pair.close).toBe('string');
      });
    });

    it('should include bracket auto-closing', () => {
      const opens = languageConfig.autoClosingPairs.map((pair: any) => pair.open);
      expect(opens).toContain('{');
      expect(opens).toContain('[');
      expect(opens).toContain('(');
    });

    it('should include quote auto-closing', () => {
      const opens = languageConfig.autoClosingPairs.map((pair: any) => pair.open);
      expect(opens).toContain('"');
      expect(opens).toContain("'");
    });
  });

  describe('Surrounding Pairs', () => {
    it('should define surrounding pairs', () => {
      expect(languageConfig.surroundingPairs).toBeDefined();
      expect(Array.isArray(languageConfig.surroundingPairs)).toBe(true);
    });

    it('should have valid surrounding pair format', () => {
      languageConfig.surroundingPairs.forEach((pair: any) => {
        expect(Array.isArray(pair)).toBe(true);
        expect(pair).toHaveLength(2);
        expect(typeof pair[0]).toBe('string');
        expect(typeof pair[1]).toBe('string');
      });
    });
  });

  describe('Word Pattern', () => {
    it('should define word pattern', () => {
      expect(languageConfig.wordPattern).toBeDefined();
      expect(typeof languageConfig.wordPattern).toBe('string');
    });

    it('should be a valid regex pattern', () => {
      expect(() => new RegExp(languageConfig.wordPattern)).not.toThrow();
    });
  });

  describe('Configuration Completeness', () => {
    it('should have all required fields', () => {
      expect(languageConfig.comments).toBeDefined();
      expect(languageConfig.brackets).toBeDefined();
      expect(languageConfig.autoClosingPairs).toBeDefined();
      expect(languageConfig.surroundingPairs).toBeDefined();
    });

    it('should have at minimum line or block comments', () => {
      const hasLineComment = languageConfig.comments.lineComment !== undefined;
      const hasBlockComment = languageConfig.comments.blockComment !== undefined;
      expect(hasLineComment || hasBlockComment).toBe(true);
    });

    it('should have at least one bracket pair', () => {
      expect(languageConfig.brackets.length).toBeGreaterThanOrEqual(1);
    });
  });
});
