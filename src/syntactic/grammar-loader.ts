import * as fs from 'fs';
import * as path from 'path';
import { validateGrammar, ValidationResult } from './scope-validator';

export interface GrammarLoadResult {
  success: boolean;
  grammar?: any;
  validation?: ValidationResult;
  error?: string;
}

/**
 * Loads and validates a TextMate grammar file
 * @param grammarPath Path to the .tmLanguage.json file
 * @returns Load result with validation information
 */
export async function loadGrammar(grammarPath: string): Promise<GrammarLoadResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(grammarPath)) {
      return {
        success: false,
        error: `Grammar file not found: ${grammarPath}`
      };
    }

    // Read and parse the grammar file
    const content = fs.readFileSync(grammarPath, 'utf-8');
    let grammar: any;
    
    try {
      grammar = JSON.parse(content);
    } catch (parseError: any) {
      return {
        success: false,
        error: `Failed to parse grammar JSON: ${parseError.message}`
      };
    }

    // Validate the grammar
    const validation = validateGrammar(grammar);

    if (!validation.valid) {
      return {
        success: false,
        grammar,
        validation,
        error: `Grammar validation failed: ${validation.errors.join('; ')}`
      };
    }

    return {
      success: true,
      grammar,
      validation
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Unexpected error loading grammar: ${error.message}`
    };
  }
}

/**
 * Validates a grammar file without loading it into memory
 * @param grammarPath Path to the .tmLanguage.json file
 * @returns Validation result
 */
export async function validateGrammarFile(grammarPath: string): Promise<ValidationResult> {
  const result = await loadGrammar(grammarPath);
  
  if (!result.success) {
    return {
      valid: false,
      invalidScopes: [],
      errors: [result.error || 'Unknown error']
    };
  }

  return result.validation || {
    valid: true,
    invalidScopes: [],
    errors: []
  };
}
