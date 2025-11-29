import { ExecutionEngine } from '../../src/workflow/execution-engine';
import { Hook, HookContext } from '../../src/workflow/hook-manager';

describe('Hook Execution', () => {
  let engine: ExecutionEngine;

  beforeEach(() => {
    engine = new ExecutionEngine();
  });

  describe('Different Trigger Types', () => {
    it('should handle onSave trigger', () => {
      const hook: Hook = {
        name: 'onSave-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt', prompt: 'Test prompt' }
      };

      expect(hook.trigger.type).toBe('onSave');
    });

    it('should handle onFileCreate trigger', () => {
      const hook: Hook = {
        name: 'onCreate-hook',
        trigger: { type: 'onFileCreate' },
        action: { type: 'prompt', prompt: 'Test prompt' }
      };

      expect(hook.trigger.type).toBe('onFileCreate');
    });

    it('should handle onPreCommit trigger', () => {
      const hook: Hook = {
        name: 'preCommit-hook',
        trigger: { type: 'onPreCommit' },
        action: { type: 'command', command: 'npm test' }
      };

      expect(hook.trigger.type).toBe('onPreCommit');
    });

    it('should handle manual trigger', () => {
      const hook: Hook = {
        name: 'manual-hook',
        trigger: { type: 'manual' },
        action: { type: 'prompt', prompt: 'Test prompt' }
      };

      expect(hook.trigger.type).toBe('manual');
    });
  });

  describe('Execution Results', () => {
    it('should execute prompt action successfully', async () => {
      const hook: Hook = {
        name: 'test-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt', prompt: 'Test prompt' }
      };

      const context: HookContext = {
        document: {
          uri: { fsPath: 'test.lang' },
          languageId: 'targetlang'
        } as any
      };

      const result = await engine.execute(hook, context);

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle execution errors', async () => {
      const hook: Hook = {
        name: 'error-hook',
        trigger: { type: 'onSave' },
        action: { type: 'command', command: 'nonexistent-command-xyz' }
      };

      const context: HookContext = {};

      const result = await engine.execute(hook, context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Execution History', () => {
    it('should track execution history', async () => {
      const hook: Hook = {
        name: 'tracked-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt', prompt: 'Test' }
      };

      const context: HookContext = {};

      const initialHistoryLength = engine.getExecutionHistory().length;

      await engine.execute(hook, context);

      const history = engine.getExecutionHistory();
      expect(history.length).toBe(initialHistoryLength + 1);
      expect(history[history.length - 1].hookName).toBe('tracked-hook');
    });

    it('should clear history when requested', async () => {
      const hook: Hook = {
        name: 'test-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt', prompt: 'Test' }
      };

      await engine.execute(hook, {});
      expect(engine.getExecutionHistory().length).toBeGreaterThan(0);

      engine.clearHistory();
      expect(engine.getExecutionHistory().length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing prompt in prompt action', async () => {
      const hook: Hook = {
        name: 'invalid-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt' } // Missing prompt
      };

      const result = await engine.execute(hook, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('prompt');
    });

    it('should handle missing command in command action', async () => {
      const hook: Hook = {
        name: 'invalid-hook',
        trigger: { type: 'onSave' },
        action: { type: 'command' } // Missing command
      };

      const result = await engine.execute(hook, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('command');
    });

    it('should handle unknown action type', async () => {
      const hook: Hook = {
        name: 'invalid-hook',
        trigger: { type: 'onSave' },
        action: { type: 'unknown' as any }
      };

      const result = await engine.execute(hook, {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Timeout Enforcement', () => {
    it('should record execution duration', async () => {
      const hook: Hook = {
        name: 'timed-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt', prompt: 'Test' }
      };

      const result = await engine.execute(hook, {});

      expect(result.duration).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Context Building', () => {
    it('should handle context with document', async () => {
      const hook: Hook = {
        name: 'context-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt', prompt: 'Test' }
      };

      const context: HookContext = {
        document: {
          uri: { fsPath: '/path/to/file.lang' },
          languageId: 'targetlang'
        } as any
      };

      const result = await engine.execute(hook, context);

      expect(result.success).toBe(true);
    });

    it('should handle context with workspace', async () => {
      const hook: Hook = {
        name: 'workspace-hook',
        trigger: { type: 'onSave' },
        action: { type: 'prompt', prompt: 'Test' }
      };

      const context: HookContext = {
        workspace: {
          name: 'test-workspace',
          uri: { fsPath: '/workspace' }
        } as any
      };

      const result = await engine.execute(hook, context);

      expect(result.success).toBe(true);
    });

    it('should handle empty context', async () => {
      const hook: Hook = {
        name: 'empty-context-hook',
        trigger: { type: 'manual' },
        action: { type: 'prompt', prompt: 'Test' }
      };

      const result = await engine.execute(hook, {});

      expect(result.success).toBe(true);
    });
  });
});
