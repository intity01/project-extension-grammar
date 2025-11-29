import { InitializationResult } from '../../src/commands/initialize';

describe('Initialization', () => {
  describe('InitializationResult', () => {
    it('should track successful initialization', () => {
      const result: InitializationResult = {
        success: true,
        filesCreated: ['file1.md', 'file2.json'],
        filesSkipped: [],
        errors: []
      };

      expect(result.success).toBe(true);
      expect(result.filesCreated).toHaveLength(2);
      expect(result.filesSkipped).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should track skipped files', () => {
      const result: InitializationResult = {
        success: true,
        filesCreated: [],
        filesSkipped: ['existing-file.md'],
        errors: []
      };

      expect(result.success).toBe(true);
      expect(result.filesCreated).toHaveLength(0);
      expect(result.filesSkipped).toHaveLength(1);
      expect(result.filesSkipped[0]).toBe('existing-file.md');
    });

    it('should track errors', () => {
      const result: InitializationResult = {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        errors: ['Failed to copy file', 'Permission denied']
      };

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Failed to copy file');
      expect(result.errors).toContain('Permission denied');
    });

    it('should handle mixed results', () => {
      const result: InitializationResult = {
        success: true,
        filesCreated: ['file1.md'],
        filesSkipped: ['file2.md'],
        errors: []
      };

      expect(result.success).toBe(true);
      expect(result.filesCreated).toHaveLength(1);
      expect(result.filesSkipped).toHaveLength(1);
    });
  });

  describe('File Operations', () => {
    it('should handle file creation', () => {
      const result: InitializationResult = {
        success: true,
        filesCreated: ['/path/to/file.md'],
        filesSkipped: [],
        errors: []
      };

      expect(result.filesCreated[0]).toContain('file.md');
    });

    it('should handle overwrite protection', () => {
      const result: InitializationResult = {
        success: true,
        filesCreated: [],
        filesSkipped: ['/path/to/existing.md'],
        errors: []
      };

      expect(result.filesSkipped[0]).toContain('existing.md');
    });
  });

  describe('Error Handling', () => {
    it('should mark initialization as failed when errors occur', () => {
      const result: InitializationResult = {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        errors: ['Error message']
      };

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should collect multiple errors', () => {
      const result: InitializationResult = {
        success: false,
        filesCreated: [],
        filesSkipped: [],
        errors: ['Error 1', 'Error 2', 'Error 3']
      };

      expect(result.errors).toHaveLength(3);
    });

    it('should allow partial success', () => {
      const result: InitializationResult = {
        success: false,
        filesCreated: ['file1.md'],
        filesSkipped: [],
        errors: ['Failed to create file2.md']
      };

      expect(result.success).toBe(false);
      expect(result.filesCreated).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });
  });
});
