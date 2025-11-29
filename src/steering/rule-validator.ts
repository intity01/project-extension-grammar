import Ajv, { JSONSchemaType } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { SteeringFileFrontmatter } from './steering-manager';
import { isValidPattern } from './file-loader';
import { debounce } from '../utils/debounce';

export interface ValidationError {
  field: string;
  message: string;
  line?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// JSON Schema for frontmatter validation
const frontmatterSchema: JSONSchemaType<SteeringFileFrontmatter> = {
  type: 'object',
  properties: {
    inclusion: {
      type: 'string',
      enum: ['always', 'fileMatch', 'manual']
    },
    fileMatchPattern: {
      type: 'string',
      nullable: true
    },
    priority: {
      type: 'number',
      nullable: true,
      minimum: 0,
      maximum: 100
    }
  },
  required: ['inclusion'],
  additionalProperties: true,
  if: {
    properties: {
      inclusion: { const: 'fileMatch' }
    }
  },
  then: {
    required: ['fileMatchPattern']
  }
};

/**
 * Validates a steering file
 */
export function validateSteeringFile(filePath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      errors: [{
        field: 'file',
        message: `File not found: ${filePath}`
      }],
      warnings: []
    };
  }

  // Read file content
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error: any) {
    return {
      valid: false,
      errors: [{
        field: 'file',
        message: `Failed to read file: ${error.message}`
      }],
      warnings: []
    };
  }

  // Parse frontmatter
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(content);
  } catch (error: any) {
    return {
      valid: false,
      errors: [{
        field: 'frontmatter',
        message: `Failed to parse frontmatter: ${error.message}`,
        line: 1
      }],
      warnings: []
    };
  }

  // Validate frontmatter against schema
  const ajv = new Ajv();
  const validate = ajv.compile(frontmatterSchema);
  const valid = validate(parsed.data);

  if (!valid && validate.errors) {
    for (const error of validate.errors) {
      errors.push({
        field: error.instancePath || 'frontmatter',
        message: error.message || 'Validation error'
      });
    }
  }

  // Additional validation for fileMatchPattern
  if (parsed.data.inclusion === 'fileMatch') {
    if (!parsed.data.fileMatchPattern) {
      errors.push({
        field: 'fileMatchPattern',
        message: 'fileMatchPattern is required when inclusion is "fileMatch"'
      });
    } else if (!isValidPattern(parsed.data.fileMatchPattern)) {
      errors.push({
        field: 'fileMatchPattern',
        message: `Invalid glob pattern: ${parsed.data.fileMatchPattern}`
      });
    }
  }

  // Validate priority range
  if (parsed.data.priority !== undefined) {
    if (typeof parsed.data.priority !== 'number') {
      errors.push({
        field: 'priority',
        message: 'Priority must be a number'
      });
    } else if (parsed.data.priority < 0 || parsed.data.priority > 100) {
      warnings.push({
        field: 'priority',
        message: 'Priority should be between 0 and 100'
      });
    }
  }

  // Check if content is empty
  if (!parsed.content || parsed.content.trim().length === 0) {
    warnings.push({
      field: 'content',
      message: 'Steering file content is empty'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates frontmatter syntax
 */
export function validateFrontmatterSyntax(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    matter(content);
  } catch (error: any) {
    errors.push({
      field: 'frontmatter',
      message: `Syntax error: ${error.message}`,
      line: error.line
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validates a file match pattern
 */
export function validateFileMatchPattern(pattern: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!pattern || pattern.trim().length === 0) {
    errors.push({
      field: 'fileMatchPattern',
      message: 'Pattern cannot be empty'
    });
  } else if (!isValidPattern(pattern)) {
    errors.push({
      field: 'fileMatchPattern',
      message: `Invalid glob pattern: ${pattern}`
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(result: ValidationResult, filePath: string): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push(`Validation errors in ${path.basename(filePath)}:`);
    for (const error of result.errors) {
      const location = error.line ? ` (line ${error.line})` : '';
      lines.push(`  - ${error.field}${location}: ${error.message}`);
    }
  }

  if (result.warnings.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('Warnings:');
    for (const warning of result.warnings) {
      lines.push(`  - ${warning.field}: ${warning.message}`);
    }
  }

  return lines.join('\n');
}

/**
 * Debounced version of validateSteeringFile for performance optimization
 * Delays validation by 500ms to avoid excessive operations during rapid changes
 */
export const validateSteeringFileDebounced = debounce(validateSteeringFile, 500);
