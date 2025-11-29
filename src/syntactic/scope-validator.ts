/**
 * Standard TextMate scope names as defined by the TextMate grammar specification
 * @see https://macromates.com/manual/en/language_grammars
 */
export const STANDARD_SCOPE_PREFIXES = [
  'comment',
  'constant',
  'entity',
  'invalid',
  'keyword',
  'markup',
  'meta',
  'storage',
  'string',
  'support',
  'variable'
];

/**
 * Validates that a scope name follows TextMate standards
 * @param scopeName The scope name to validate (e.g., "keyword.control.if")
 * @returns true if the scope name is valid, false otherwise
 */
export function isValidScopeName(scopeName: string): boolean {
  if (!scopeName || typeof scopeName !== 'string') {
    return false;
  }

  const parts = scopeName.split('.');
  if (parts.length === 0) {
    return false;
  }

  const prefix = parts[0];
  return STANDARD_SCOPE_PREFIXES.includes(prefix);
}

/**
 * Extracts all scope names from a TextMate grammar object
 * @param grammar The grammar object to extract scope names from
 * @returns Array of all scope names found in the grammar
 */
export function extractScopeNames(grammar: any): string[] {
  const scopes: string[] = [];

  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (obj.name && typeof obj.name === 'string') {
      scopes.push(obj.name);
    }

    if (obj.scopeName && typeof obj.scopeName === 'string') {
      scopes.push(obj.scopeName);
    }

    if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else {
      Object.values(obj).forEach(traverse);
    }
  }

  traverse(grammar);
  return scopes;
}

export interface ValidationResult {
  valid: boolean;
  invalidScopes: string[];
  errors: string[];
}

/**
 * Validates all scope names in a TextMate grammar
 * @param grammar The grammar object to validate
 * @returns Validation result with any invalid scopes found
 */
export function validateGrammar(grammar: any): ValidationResult {
  const errors: string[] = [];
  
  if (!grammar) {
    return {
      valid: false,
      invalidScopes: [],
      errors: ['Grammar object is null or undefined']
    };
  }

  const scopes = extractScopeNames(grammar);
  const invalidScopes = scopes.filter(scope => !isValidScopeName(scope));

  if (invalidScopes.length > 0) {
    errors.push(
      `Found ${invalidScopes.length} invalid scope name(s): ${invalidScopes.join(', ')}`
    );
  }

  return {
    valid: invalidScopes.length === 0,
    invalidScopes,
    errors
  };
}
