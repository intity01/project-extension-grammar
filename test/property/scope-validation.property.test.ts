import * as fc from 'fast-check';
import { isValidScopeName, validateGrammar, STANDARD_SCOPE_PREFIXES } from '../../src/syntactic/scope-validator';

// Feature: project-extension-grammar, Property 1: Standard Scope Name Compliance
describe('Property 1: Standard Scope Name Compliance', () => {
  
  // Generator for valid scope names
  const validScopeNameArb = fc.tuple(
    fc.constantFrom(...STANDARD_SCOPE_PREFIXES),
    fc.array(fc.stringMatching(/^[a-z][a-z0-9-]*$/), { minLength: 0, maxLength: 3 })
  ).map(([prefix, suffixes]) => {
    return [prefix, ...suffixes].join('.');
  });

  // Generator for invalid scope names (non-standard prefix)
  const invalidScopeNameArb = fc.tuple(
    fc.string({ minLength: 1 }).filter(s => !STANDARD_SCOPE_PREFIXES.includes(s.split('.')[0])),
    fc.array(fc.stringMatching(/^[a-z][a-z0-9-]*$/), { minLength: 0, maxLength: 2 })
  ).map(([prefix, suffixes]) => {
    return [prefix, ...suffixes].join('.');
  });

  it('should accept all valid standard scope names', () => {
    fc.assert(
      fc.property(validScopeNameArb, (scopeName) => {
        const result = isValidScopeName(scopeName);
        expect(result).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject all non-standard scope names', () => {
    fc.assert(
      fc.property(invalidScopeNameArb, (scopeName) => {
        const result = isValidScopeName(scopeName);
        expect(result).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate grammars with only standard scope names', () => {
    fc.assert(
      fc.property(
        fc.array(validScopeNameArb, { minLength: 1, maxLength: 10 }),
        (scopes) => {
          const grammar = {
            patterns: scopes.map(name => ({ name }))
          };
          
          const result = validateGrammar(grammar);
          expect(result.valid).toBe(true);
          expect(result.invalidScopes).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject grammars with any non-standard scope names', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.array(validScopeNameArb, { minLength: 0, maxLength: 5 }),
          fc.array(invalidScopeNameArb, { minLength: 1, maxLength: 3 })
        ),
        ([validScopes, invalidScopes]) => {
          const allScopes = [...validScopes, ...invalidScopes];
          const grammar = {
            patterns: allScopes.map(name => ({ name }))
          };
          
          const result = validateGrammar(grammar);
          expect(result.valid).toBe(false);
          expect(result.invalidScopes.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle nested grammar structures', () => {
    fc.assert(
      fc.property(
        fc.array(validScopeNameArb, { minLength: 1, maxLength: 5 }),
        (scopes) => {
          const grammar = {
            repository: {
              keywords: {
                patterns: scopes.map(name => ({ name }))
              }
            }
          };
          
          const result = validateGrammar(grammar);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate scopeName field in addition to name field', () => {
    fc.assert(
      fc.property(
        validScopeNameArb,
        (scopeName) => {
          const grammar = {
            scopeName: scopeName,
            patterns: []
          };
          
          const result = validateGrammar(grammar);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
