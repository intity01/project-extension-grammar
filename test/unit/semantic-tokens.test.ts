import { TOKEN_TYPES, TOKEN_MODIFIERS, createSemanticTokensLegend } from '../../src/semantic/semantic-tokens';

describe('SemanticTokensProvider', () => {
  describe('Token Types and Modifiers', () => {
    it('should define standard token types', () => {
      expect(TOKEN_TYPES).toBeDefined();
      expect(Array.isArray(TOKEN_TYPES)).toBe(true);
      expect(TOKEN_TYPES.length).toBeGreaterThan(0);
    });

    it('should include common token types', () => {
      expect(TOKEN_TYPES).toContain('class');
      expect(TOKEN_TYPES).toContain('function');
      expect(TOKEN_TYPES).toContain('variable');
      expect(TOKEN_TYPES).toContain('keyword');
      expect(TOKEN_TYPES).toContain('string');
    });

    it('should define standard token modifiers', () => {
      expect(TOKEN_MODIFIERS).toBeDefined();
      expect(Array.isArray(TOKEN_MODIFIERS)).toBe(true);
      expect(TOKEN_MODIFIERS.length).toBeGreaterThan(0);
    });

    it('should include common token modifiers', () => {
      expect(TOKEN_MODIFIERS).toContain('declaration');
      expect(TOKEN_MODIFIERS).toContain('readonly');
      expect(TOKEN_MODIFIERS).toContain('static');
      expect(TOKEN_MODIFIERS).toContain('deprecated');
    });
  });

  describe('Legend Creation', () => {
    it('should create semantic tokens legend', () => {
      const legend = createSemanticTokensLegend();
      expect(legend).toBeDefined();
      expect(legend.tokenTypes).toEqual(TOKEN_TYPES);
      expect(legend.tokenModifiers).toEqual(TOKEN_MODIFIERS);
    });
  });
});
