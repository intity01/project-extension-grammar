import { LSPClientConfig } from '../../src/semantic/lsp-client';

describe('LSPClientManager', () => {
  describe('Configuration', () => {
    it('should define LSPClientConfig interface', () => {
      const config: LSPClientConfig = {
        serverPath: '/path/to/server',
        enabled: true,
        timeout: 500
      };
      
      expect(config.serverPath).toBe('/path/to/server');
      expect(config.enabled).toBe(true);
      expect(config.timeout).toBe(500);
    });

    it('should allow optional timeout', () => {
      const config: LSPClientConfig = {
        serverPath: '/path/to/server',
        enabled: true
      };
      
      expect(config.serverPath).toBe('/path/to/server');
      expect(config.enabled).toBe(true);
      expect(config.timeout).toBeUndefined();
    });

    it('should allow optional server args', () => {
      const config: LSPClientConfig = {
        serverPath: '/path/to/server',
        serverArgs: ['--stdio', '--verbose'],
        enabled: true
      };
      
      expect(config.serverArgs).toEqual(['--stdio', '--verbose']);
    });

    it('should support disabled state', () => {
      const config: LSPClientConfig = {
        serverPath: '/path/to/server',
        enabled: false
      };
      
      expect(config.enabled).toBe(false);
    });
  });
});
