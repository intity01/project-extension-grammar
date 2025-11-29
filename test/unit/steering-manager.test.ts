import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SteeringManager, FileContext } from '../../src/steering/steering-manager';
import { loadSteeringFile, sortByPriority } from '../../src/steering/file-loader';

describe('SteeringManager', () => {
  let tempDir: string;
  let manager: SteeringManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'steering-manager-test-'));
    const steeringDir = path.join(tempDir, '.kiro', 'steering');
    fs.mkdirSync(steeringDir, { recursive: true });
    manager = new SteeringManager(tempDir);
  });

  afterEach(() => {
    manager.dispose();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('File Loading with Different Inclusion Types', () => {
    it('should load files with inclusion: always', async () => {
      const content = `---
inclusion: always
priority: 10
---

# Always Loaded Rule`;

      const filePath = path.join(tempDir, '.kiro', 'steering', 'always.md');
      fs.writeFileSync(filePath, content);

      const context: FileContext = {};
      const files = await manager.loadSteeringFiles(context);

      expect(files.length).toBe(1);
      expect(files[0].frontmatter.inclusion).toBe('always');
    });

    it('should load fileMatch files when pattern matches', async () => {
      const content = `---
inclusion: fileMatch
fileMatchPattern: "**/*.lang"
---

# File Match Rule`;

      const filePath = path.join(tempDir, '.kiro', 'steering', 'filematch.md');
      fs.writeFileSync(filePath, content);

      const context: FileContext = {
        document: {
          uri: { fsPath: 'test.lang' }
        } as any
      };

      const files = await manager.loadSteeringFiles(context);

      expect(files.length).toBe(1);
      expect(files[0].frontmatter.inclusion).toBe('fileMatch');
    });

    it('should not load fileMatch files when pattern does not match', async () => {
      const content = `---
inclusion: fileMatch
fileMatchPattern: "**/*.lang"
---

# File Match Rule`;

      const filePath = path.join(tempDir, '.kiro', 'steering', 'filematch.md');
      fs.writeFileSync(filePath, content);

      const context: FileContext = {
        document: {
          uri: { fsPath: 'test.py' }
        } as any
      };

      const files = await manager.loadSteeringFiles(context);

      expect(files.length).toBe(0);
    });

    it('should not load manual files', async () => {
      const content = `---
inclusion: manual
---

# Manual Rule`;

      const filePath = path.join(tempDir, '.kiro', 'steering', 'manual.md');
      fs.writeFileSync(filePath, content);

      const context: FileContext = {};
      const files = await manager.loadSteeringFiles(context);

      expect(files.length).toBe(0);
    });
  });

  describe('Priority-Based Ordering', () => {
    it('should sort files by priority (higher first)', async () => {
      const files = [
        {
          path: '/test/low.md',
          content: 'Low priority',
          frontmatter: { inclusion: 'always' as const, priority: 5 }
        },
        {
          path: '/test/high.md',
          content: 'High priority',
          frontmatter: { inclusion: 'always' as const, priority: 50 }
        },
        {
          path: '/test/medium.md',
          content: 'Medium priority',
          frontmatter: { inclusion: 'always' as const, priority: 25 }
        }
      ];

      const sorted = sortByPriority([...files]);

      expect(sorted[0].frontmatter.priority).toBe(50);
      expect(sorted[1].frontmatter.priority).toBe(25);
      expect(sorted[2].frontmatter.priority).toBe(5);
    });

    it('should handle files without priority (default to 0)', async () => {
      const files = [
        {
          path: '/test/no-priority.md',
          content: 'No priority',
          frontmatter: { inclusion: 'always' as const }
        },
        {
          path: '/test/with-priority.md',
          content: 'With priority',
          frontmatter: { inclusion: 'always' as const, priority: 10 }
        }
      ];

      const sorted = sortByPriority([...files]);

      expect(sorted[0].frontmatter.priority).toBe(10);
      expect(sorted[1].frontmatter.priority).toBeUndefined();
    });
  });

  describe('Cache Management', () => {
    it('should cache loaded files', async () => {
      const content = `---
inclusion: always
---

# Cached Rule`;

      const filePath = path.join(tempDir, '.kiro', 'steering', 'cached.md');
      fs.writeFileSync(filePath, content);

      const context: FileContext = {};
      
      // Load twice
      await manager.loadSteeringFiles(context);
      const files = await manager.loadSteeringFiles(context);

      expect(files.length).toBe(1);
    });

    it('should clear cache when requested', () => {
      manager.clearCache();
      // Should not throw
    });
  });

  describe('File Loader', () => {
    it('should load and parse steering file', () => {
      const content = `---
inclusion: always
priority: 10
---

# Test Content`;

      const filePath = path.join(tempDir, 'test.md');
      fs.writeFileSync(filePath, content);

      const file = loadSteeringFile(filePath);

      expect(file.path).toBe(filePath);
      expect(file.content).toContain('# Test Content');
      expect(file.frontmatter.inclusion).toBe('always');
      expect(file.frontmatter.priority).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing steering directory', async () => {
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'empty-'));
      const emptyManager = new SteeringManager(emptyDir);

      const context: FileContext = {};
      const files = await emptyManager.loadSteeringFiles(context);

      expect(files).toEqual([]);

      emptyManager.dispose();
      fs.rmSync(emptyDir, { recursive: true, force: true });
    });

    it('should handle invalid steering files gracefully', async () => {
      const invalidContent = `---
invalid yaml: [
---

# Content`;

      const filePath = path.join(tempDir, '.kiro', 'steering', 'invalid.md');
      fs.writeFileSync(filePath, invalidContent);

      const context: FileContext = {};
      const files = await manager.loadSteeringFiles(context);

      // Should not crash, just skip invalid files
      expect(Array.isArray(files)).toBe(true);
    });
  });
});
