import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { validateSteeringFile, validateFileMatchPattern, formatValidationErrors } from '../../src/steering/rule-validator';

// Feature: project-extension-grammar, Property 9: Configuration Validation with Error Reporting
describe('Property 9: Configuration Validation with Error Reporting', () => {

  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'steering-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Generator for valid inclusion types
  const validInclusionArb = fc.constantFrom('always', 'fileMatch', 'manual');

  // Generator for valid file patterns
  const validPatternArb = fc.oneof(
    fc.constant('**/*.lang'),
    fc.constant('*.lang'),
    fc.constant('src/**/*.lang')
  );

  // Generator for valid priorities
  const validPriorityArb = fc.integer({ min: 0, max: 100 });

  it('should accept valid steering files with all required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          inclusion: validInclusionArb,
          pattern: fc.option(validPatternArb),
          priority: fc.option(validPriorityArb)
        }),
        (config) => {
          const frontmatter: any = {
            inclusion: config.inclusion
          };

          if (config.inclusion === 'fileMatch' && config.pattern) {
            frontmatter.fileMatchPattern = config.pattern;
          }

          if (config.priority !== null) {
            frontmatter.priority = config.priority;
          }

          const content = `---
${Object.entries(frontmatter).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}
---

# Test Content
This is test content.`;

          const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.md`);
          fs.writeFileSync(filePath, content);

          const result = validateSteeringFile(filePath);

          // If inclusion is fileMatch, pattern must be provided
          if (config.inclusion === 'fileMatch' && !config.pattern) {
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          } else {
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }

          fs.unlinkSync(filePath);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject steering files with invalid inclusion types', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !['always', 'fileMatch', 'manual'].includes(s)),
        (invalidInclusion) => {
          const content = `---
inclusion: ${JSON.stringify(invalidInclusion)}
---

# Test Content`;

          const filePath = path.join(tempDir, `test-invalid-${Date.now()}.md`);
          fs.writeFileSync(filePath, content);

          const result = validateSteeringFile(filePath);

          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);

          fs.unlinkSync(filePath);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should reject fileMatch without pattern', () => {
    const content = `---
inclusion: fileMatch
---

# Test Content`;

    const filePath = path.join(tempDir, 'test-no-pattern.md');
    fs.writeFileSync(filePath, content);

    const result = validateSteeringFile(filePath);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field.includes('fileMatchPattern'))).toBe(true);

    fs.unlinkSync(filePath);
  });

  it('should provide error messages for all validation failures', () => {
    fc.assert(
      fc.property(
        fc.record({
          inclusion: fc.option(validInclusionArb),
          priority: fc.option(fc.integer({ min: -100, max: 200 }))
        }),
        (config) => {
          const frontmatter: any = {};

          if (config.inclusion !== null) {
            frontmatter.inclusion = config.inclusion;
          }

          if (config.priority !== null) {
            frontmatter.priority = config.priority;
          }

          const content = `---
${Object.entries(frontmatter).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}
---

# Test Content`;

          const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.md`);
          fs.writeFileSync(filePath, content);

          const result = validateSteeringFile(filePath);

          // Every error should have a message
          for (const error of result.errors) {
            expect(error.message).toBeDefined();
            expect(error.message.length).toBeGreaterThan(0);
            expect(error.field).toBeDefined();
          }

          // Every warning should have a message
          for (const warning of result.warnings) {
            expect(warning.message).toBeDefined();
            expect(warning.message.length).toBeGreaterThan(0);
            expect(warning.field).toBeDefined();
          }

          fs.unlinkSync(filePath);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format validation errors with file path', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/).filter(s => s.length > 0 && s.length <= 20),
        (filename) => {
          const content = `---
inclusion: invalid
---

# Test`;

          const filePath = path.join(tempDir, `${filename}.md`);
          fs.writeFileSync(filePath, content);

          const result = validateSteeringFile(filePath);
          const formatted = formatValidationErrors(result, filePath);

          expect(formatted).toContain(path.basename(filePath));
          expect(formatted.length).toBeGreaterThan(0);

          fs.unlinkSync(filePath);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should validate file match patterns correctly', () => {
    fc.assert(
      fc.property(
        validPatternArb,
        (pattern) => {
          const result = validateFileMatchPattern(pattern);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject empty patterns', () => {
    const result = validateFileMatchPattern('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle non-existent files gracefully', () => {
    const result = validateSteeringFile('/nonexistent/file.md');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('not found');
  });
});
