import * as fc from 'fast-check';
import { RecursionGuard } from '../../src/workflow/recursion-guard';
import { Hook, HookContext } from '../../src/workflow/hook-manager';

// Feature: project-extension-grammar, Property 6: Hook Recursion Prevention
describe('Property 6: Hook Recursion Prevention', () => {

  let guard: RecursionGuard;

  beforeEach(() => {
    guard = new RecursionGuard();
  });

  // Generator for hook names
  const hookNameArb = fc.oneof(
    fc.constant('test-hook'),
    fc.constant('auto-test'),
    fc.constant('auto-doc'),
    fc.constant('format-hook')
  );

  // Generator for file paths
  const filePathArb = fc.oneof(
    fc.constant('test.lang'),
    fc.constant('src/test.lang'),
    fc.constant('test.py')
  );

  it('should prevent recursion when same hook executes on same file', () => {
    fc.assert(
      fc.property(
        fc.tuple(hookNameArb, filePathArb),
        ([hookName, filePath]) => {
          const hook: Hook = {
            name: hookName,
            trigger: { type: 'onSave' },
            action: { type: 'prompt', prompt: 'Test' },
            preventRecursion: true
          };

          const context: HookContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          // First execution should not cause recursion
          expect(guard.wouldCauseRecursion(hook, context)).toBe(false);

          // Enter execution
          guard.enterExecution(hook, context);

          // Second execution should be prevented
          expect(guard.wouldCauseRecursion(hook, context)).toBe(true);

          // Exit execution
          guard.exitExecution(hook, context);

          // After exit, the entry is removed, so no recursion detected
          expect(guard.wouldCauseRecursion(hook, context)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow execution when preventRecursion is false', () => {
    fc.assert(
      fc.property(
        fc.tuple(hookNameArb, filePathArb),
        ([hookName, filePath]) => {
          const hook: Hook = {
            name: hookName,
            trigger: { type: 'onSave' },
            action: { type: 'prompt', prompt: 'Test' },
            preventRecursion: false
          };

          const context: HookContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          guard.enterExecution(hook, context);

          // Should not prevent recursion when flag is false
          expect(guard.wouldCauseRecursion(hook, context)).toBe(false);

          guard.exitExecution(hook, context);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow different hooks on same file', () => {
    fc.assert(
      fc.property(
        fc.tuple(hookNameArb, hookNameArb, filePathArb).filter(([h1, h2]) => h1 !== h2),
        ([hookName1, hookName2, filePath]) => {
          const hook1: Hook = {
            name: hookName1,
            trigger: { type: 'onSave' },
            action: { type: 'prompt', prompt: 'Test' },
            preventRecursion: true
          };

          const hook2: Hook = {
            name: hookName2,
            trigger: { type: 'onSave' },
            action: { type: 'prompt', prompt: 'Test' },
            preventRecursion: true
          };

          const context: HookContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          guard.enterExecution(hook1, context);

          // Different hook should be allowed
          expect(guard.wouldCauseRecursion(hook2, context)).toBe(false);

          guard.exitExecution(hook1, context);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow same hook on different files', () => {
    fc.assert(
      fc.property(
        fc.tuple(hookNameArb, filePathArb, filePathArb).filter(([_, f1, f2]) => f1 !== f2),
        ([hookName, filePath1, filePath2]) => {
          const hook: Hook = {
            name: hookName,
            trigger: { type: 'onSave' },
            action: { type: 'prompt', prompt: 'Test' },
            preventRecursion: true
          };

          const context1: HookContext = {
            document: {
              uri: { fsPath: filePath1 }
            } as any
          };

          const context2: HookContext = {
            document: {
              uri: { fsPath: filePath2 }
            } as any
          };

          guard.enterExecution(hook, context1);

          // Same hook on different file should be allowed
          expect(guard.wouldCauseRecursion(hook, context2)).toBe(false);

          guard.exitExecution(hook, context1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should track execution stack correctly', () => {
    fc.assert(
      fc.property(
        fc.tuple(hookNameArb, filePathArb),
        ([hookName, filePath]) => {
          const hook: Hook = {
            name: hookName,
            trigger: { type: 'onSave' },
            action: { type: 'prompt', prompt: 'Test' },
            preventRecursion: true
          };

          const context: HookContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          const initialDepth = guard.getStackDepth();

          guard.enterExecution(hook, context);
          expect(guard.getStackDepth()).toBe(initialDepth + 1);

          guard.exitExecution(hook, context);
          expect(guard.getStackDepth()).toBe(initialDepth);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect if hook is currently executing', () => {
    fc.assert(
      fc.property(
        fc.tuple(hookNameArb, filePathArb),
        ([hookName, filePath]) => {
          const hook: Hook = {
            name: hookName,
            trigger: { type: 'onSave' },
            action: { type: 'prompt', prompt: 'Test' },
            preventRecursion: true
          };

          const context: HookContext = {
            document: {
              uri: { fsPath: filePath }
            } as any
          };

          expect(guard.isExecuting(hookName, filePath)).toBe(false);

          guard.enterExecution(hook, context);
          expect(guard.isExecuting(hookName, filePath)).toBe(true);

          guard.exitExecution(hook, context);
          expect(guard.isExecuting(hookName, filePath)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear stack when requested', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(hookNameArb, filePathArb), { minLength: 1, maxLength: 5 }),
        (entries) => {
          // Add multiple entries
          for (const [hookName, filePath] of entries) {
            const hook: Hook = {
              name: hookName,
              trigger: { type: 'onSave' },
              action: { type: 'prompt', prompt: 'Test' },
              preventRecursion: true
            };

            const context: HookContext = {
              document: {
                uri: { fsPath: filePath }
              } as any
            };

            guard.enterExecution(hook, context);
          }

          expect(guard.getStackDepth()).toBeGreaterThan(0);

          guard.clearStack();
          expect(guard.getStackDepth()).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
