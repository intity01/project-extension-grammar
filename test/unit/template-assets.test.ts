import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

describe('Template Assets', () => {
  const assetsDir = path.join(__dirname, '../../assets');

  describe('Steering Templates', () => {
    const steeringDir = path.join(assetsDir, 'steering');

    it('should have rules.md template', () => {
      const rulesPath = path.join(steeringDir, 'rules.md');
      expect(fs.existsSync(rulesPath)).toBe(true);
    });

    it('should have architecture.md template', () => {
      const archPath = path.join(steeringDir, 'architecture.md');
      expect(fs.existsSync(archPath)).toBe(true);
    });

    it('should have valid frontmatter in rules.md', () => {
      const rulesPath = path.join(steeringDir, 'rules.md');
      const content = fs.readFileSync(rulesPath, 'utf-8');
      const parsed = matter(content);
      
      expect(parsed.data).toBeDefined();
      expect(parsed.data.inclusion).toBeDefined();
    });

    it('should have valid frontmatter in architecture.md', () => {
      const archPath = path.join(steeringDir, 'architecture.md');
      const content = fs.readFileSync(archPath, 'utf-8');
      const parsed = matter(content);
      
      expect(parsed.data).toBeDefined();
      expect(parsed.data.inclusion).toBeDefined();
    });

    it('should have content in steering templates', () => {
      const rulesPath = path.join(steeringDir, 'rules.md');
      const content = fs.readFileSync(rulesPath, 'utf-8');
      const parsed = matter(content);
      
      expect(parsed.content).toBeDefined();
      expect(parsed.content.length).toBeGreaterThan(0);
    });
  });

  describe('Hook Templates', () => {
    const hooksDir = path.join(assetsDir, 'hooks');

    it('should have auto-test.json template', () => {
      const testPath = path.join(hooksDir, 'auto-test.json');
      expect(fs.existsSync(testPath)).toBe(true);
    });

    it('should have auto-doc.json template', () => {
      const docPath = path.join(hooksDir, 'auto-doc.json');
      expect(fs.existsSync(docPath)).toBe(true);
    });

    it('should have valid JSON in auto-test.json', () => {
      const testPath = path.join(hooksDir, 'auto-test.json');
      const content = fs.readFileSync(testPath, 'utf-8');
      
      expect(() => JSON.parse(content)).not.toThrow();
      
      const hook = JSON.parse(content);
      expect(hook.name).toBeDefined();
      expect(hook.trigger).toBeDefined();
      expect(hook.action).toBeDefined();
    });

    it('should have valid JSON in auto-doc.json', () => {
      const docPath = path.join(hooksDir, 'auto-doc.json');
      const content = fs.readFileSync(docPath, 'utf-8');
      
      expect(() => JSON.parse(content)).not.toThrow();
      
      const hook = JSON.parse(content);
      expect(hook.name).toBeDefined();
      expect(hook.trigger).toBeDefined();
      expect(hook.action).toBeDefined();
    });

    it('should have required hook fields', () => {
      const testPath = path.join(hooksDir, 'auto-test.json');
      const content = fs.readFileSync(testPath, 'utf-8');
      const hook = JSON.parse(content);
      
      expect(hook.trigger.type).toBeDefined();
      expect(hook.action.type).toBeDefined();
    });
  });

  describe('Template Structure', () => {
    it('should have assets directory', () => {
      expect(fs.existsSync(assetsDir)).toBe(true);
    });

    it('should have steering subdirectory', () => {
      const steeringDir = path.join(assetsDir, 'steering');
      expect(fs.existsSync(steeringDir)).toBe(true);
    });

    it('should have hooks subdirectory', () => {
      const hooksDir = path.join(assetsDir, 'hooks');
      expect(fs.existsSync(hooksDir)).toBe(true);
    });

    it('should have at least 2 steering templates', () => {
      const steeringDir = path.join(assetsDir, 'steering');
      const files = fs.readdirSync(steeringDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      expect(mdFiles.length).toBeGreaterThanOrEqual(2);
    });

    it('should have at least 2 hook templates', () => {
      const hooksDir = path.join(assetsDir, 'hooks');
      const files = fs.readdirSync(hooksDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      expect(jsonFiles.length).toBeGreaterThanOrEqual(2);
    });
  });
});
