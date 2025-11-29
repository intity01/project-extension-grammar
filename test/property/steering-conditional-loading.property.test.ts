import * as fc from 'fast-check';
import { shouldLoadFile, matchesFilePattern } from '../../src/steering/file-loader';
import { SteeringFile, FileContext } from '../../src/steering/steering-manager';

// Feature: project-extension-grammar, Property 4: Steering File Conditional Loading
describe('Property 4: Steering File Conditional Loading', () => {

  // Generator for file paths
  const filePathArb = fc.oneof(
    fc.constant('test.lang'),
    fc.constant('src/test.lang'),
    fc.constant('src/module/test.lang'),
    fc.constant('test.test.lang'),
    fc.constant('test.py'),
    fc.constant('src/test.js')
  );

  // Generator for file patterns
  const filePatternArb = fc.oneof(
    fc.constant('**/*.lang'),
    fc.constant('*.lang'),
    fc.constant('src/**/*.lang'),
    fc.constant('**/*.test.lang'),
    fc.constant('**/*.py')
  );

  it('should always load files with inclusion: always', () => {
    fc.assert(
      fc.property(
        filePathArb,
        (filePath) => {
          const file: SteeringFile = {
            path: '/test/steering.md',
            content: 'test content',
            frontmatter: {
              inclusion: 'always'
            }
          };

          const context: FileContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          const result = shouldLoadFile(file, context);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never load files with inclusion: manual', () => {
    fc.assert(
      fc.property(
        filePathArb,
        (filePath) => {
          const file: SteeringFile = {
            path: '/test/steering.md',
            content: 'test content',
            frontmatter: {
              inclusion: 'manual'
            }
          };

          const context: FileContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          const result = shouldLoadFile(file, context);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should load fileMatch files only when pattern matches', () => {
    fc.assert(
      fc.property(
        fc.tuple(filePathArb, filePatternArb),
        ([filePath, pattern]) => {
          const file: SteeringFile = {
            path: '/test/steering.md',
            content: 'test content',
            frontmatter: {
              inclusion: 'fileMatch',
              fileMatchPattern: pattern
            }
          };

          const context: FileContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          const shouldLoad = shouldLoadFile(file, context);
          const patternMatches = matchesFilePattern(filePath, pattern);

          expect(shouldLoad).toBe(patternMatches);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not load fileMatch files without document context', () => {
    fc.assert(
      fc.property(
        filePatternArb,
        (pattern) => {
          const file: SteeringFile = {
            path: '/test/steering.md',
            content: 'test content',
            frontmatter: {
              inclusion: 'fileMatch',
              fileMatchPattern: pattern
            }
          };

          const context: FileContext = {}; // No document

          const result = shouldLoadFile(file, context);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not load fileMatch files without pattern', () => {
    fc.assert(
      fc.property(
        filePathArb,
        (filePath) => {
          const file: SteeringFile = {
            path: '/test/steering.md',
            content: 'test content',
            frontmatter: {
              inclusion: 'fileMatch'
              // No fileMatchPattern
            }
          };

          const context: FileContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          const result = shouldLoadFile(file, context);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should match patterns consistently', () => {
    fc.assert(
      fc.property(
        fc.tuple(filePathArb, filePatternArb),
        ([filePath, pattern]) => {
          // Matching should be deterministic
          const result1 = matchesFilePattern(filePath, pattern);
          const result2 = matchesFilePattern(filePath, pattern);
          
          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle specific pattern matching cases', () => {
    // Test specific known cases
    expect(matchesFilePattern('test.lang', '**/*.lang')).toBe(true);
    expect(matchesFilePattern('src/test.lang', '**/*.lang')).toBe(true);
    expect(matchesFilePattern('test.py', '**/*.lang')).toBe(false);
    expect(matchesFilePattern('test.test.lang', '**/*.test.lang')).toBe(true);
    expect(matchesFilePattern('test.lang', '**/*.test.lang')).toBe(false);
  });
});
