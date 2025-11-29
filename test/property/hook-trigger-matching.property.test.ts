import * as fc from 'fast-check';
import { HookManager, Hook } from '../../src/workflow/hook-manager';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Feature: project-extension-grammar, Property 5: Hook Trigger Matching
describe('Property 5: Hook Trigger Matching', () => {

  let tempDir: string;
  let manager: HookManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-test-'));
    manager = new HookManager(tempDir);
  });

  afterEach(() => {
    manager.dispose();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Generator for file paths
  const filePathArb = fc.oneof(
    fc.constant('test.lang'),
    fc.constant('src/test.lang'),
    fc.constant('test.test.lang'),
    fc.constant('test.py'),
    fc.constant('src/module/file.js')
  );

  // Generator for file patterns
  const filePatternArb = fc.oneof(
    fc.constant('**/*.lang'),
    fc.constant('*.lang'),
    fc.constant('**/*.test.lang'),
    fc.constant('**/*.py'),
    fc.constant('src/**/*.js')
  );

  // Generator for trigger types
  const triggerTypeArb = fc.constantFrom('onSave', 'onFileCreate', 'onPreCommit', 'manual');

  it('should trigger hooks when file pattern matches', () => {
    fc.assert(
      fc.property(
        fc.tuple(filePathArb, filePatternArb, triggerTypeArb),
        ([filePath, pattern, triggerType]) => {
          const hook: Hook = {
            name: 'test-hook',
            trigger: {
              type: triggerType as any,
              filePattern: pattern
            },
            action: {
              type: 'prompt',
              prompt: 'Test prompt'
            },
            enabled: true
          };

          const shouldTrigger = manager.shouldTriggerHook(hook, filePath);

          // Manually check if pattern matches
          const { minimatch } = require('minimatch');
          const normalizedPath = filePath.replace(/\\/g, '/');
          const expectedMatch = minimatch(normalizedPath, pattern, { matchBase: true });

          expect(shouldTrigger).toBe(expectedMatch);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not trigger disabled hooks', () => {
    fc.assert(
      fc.property(
        fc.tuple(filePathArb, filePatternArb),
        ([filePath, pattern]) => {
          const hook: Hook = {
            name: 'disabled-hook',
            trigger: {
              type: 'onSave',
              filePattern: pattern
            },
            action: {
              type: 'prompt',
              prompt: 'Test prompt'
            },
            enabled: false
          };

          const shouldTrigger = manager.shouldTriggerHook(hook, filePath);

          expect(shouldTrigger).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should trigger hooks without file pattern for any file', () => {
    fc.assert(
      fc.property(
        filePathArb,
        (filePath) => {
          const hook: Hook = {
            name: 'no-pattern-hook',
            trigger: {
              type: 'onSave'
            },
            action: {
              type: 'prompt',
              prompt: 'Test prompt'
            },
            enabled: true
          };

          const shouldTrigger = manager.shouldTriggerHook(hook, filePath);

          expect(shouldTrigger).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should filter hooks by trigger type', () => {
    fc.assert(
      fc.property(
        triggerTypeArb,
        (triggerType) => {
          const hook1: Hook = {
            name: 'hook1',
            trigger: { type: triggerType as any },
            action: { type: 'prompt', prompt: 'Test' },
            enabled: true
          };

          const hook2: Hook = {
            name: 'hook2',
            trigger: { type: 'manual' },
            action: { type: 'prompt', prompt: 'Test' },
            enabled: true
          };

          manager.registerHook(hook1);
          manager.registerHook(hook2);

          const filtered = manager.getHooksByTrigger(triggerType as any);

          if (triggerType === 'manual') {
            expect(filtered.length).toBeGreaterThanOrEqual(1);
            expect(filtered.some(h => h.name === 'hook2')).toBe(true);
          } else {
            expect(filtered.some(h => h.name === 'hook1')).toBe(true);
            expect(filtered.every(h => h.trigger.type === triggerType)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle specific pattern matching cases', () => {
    const testCases = [
      { path: 'test.lang', pattern: '**/*.lang', expected: true },
      { path: 'src/test.lang', pattern: '**/*.lang', expected: true },
      { path: 'test.py', pattern: '**/*.lang', expected: false },
      { path: 'test.test.lang', pattern: '**/*.test.lang', expected: true },
      { path: 'test.lang', pattern: '*.lang', expected: true },
      { path: 'src/test.lang', pattern: '*.lang', expected: true }
    ];

    for (const testCase of testCases) {
      const hook: Hook = {
        name: 'test-hook',
        trigger: {
          type: 'onSave',
          filePattern: testCase.pattern
        },
        action: {
          type: 'prompt',
          prompt: 'Test'
        },
        enabled: true
      };

      const result = manager.shouldTriggerHook(hook, testCase.path);
      expect(result).toBe(testCase.expected);
    }
  });

  it('should consistently match patterns', () => {
    fc.assert(
      fc.property(
        fc.tuple(filePathArb, filePatternArb),
        ([filePath, pattern]) => {
          const hook: Hook = {
            name: 'consistent-hook',
            trigger: {
              type: 'onSave',
              filePattern: pattern
            },
            action: {
              type: 'prompt',
              prompt: 'Test'
            },
            enabled: true
          };

          // Should return same result when called multiple times
          const result1 = manager.shouldTriggerHook(hook, filePath);
          const result2 = manager.shouldTriggerHook(hook, filePath);

          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
