/**
 * Performance test for extension activation time
 * Target: < 2 seconds
 */

import { LazyManagerContainer } from '../../src/utils/lazy-loader';

describe('Performance: Activation Time', () => {
  it('should support lazy loading pattern', () => {
    const container = new LazyManagerContainer();
    
    // Register a mock manager
    container.register('test', () => {
      return { initialized: true };
    });

    // Verify manager is registered but not initialized
    expect(container.isInitialized('test')).toBe(false);
    
    // This test verifies the lazy loading infrastructure exists
    // Actual activation time would be measured in integration tests
  });

  it('should initialize managers only when accessed', async () => {
    const container = new LazyManagerContainer();
    let initCount = 0;
    
    container.register('test', () => {
      initCount++;
      return { value: 42 };
    });

    // Should not be initialized yet
    expect(initCount).toBe(0);
    expect(container.isInitialized('test')).toBe(false);

    // Access the manager
    const manager = await container.get('test');

    // Should now be initialized
    expect(initCount).toBe(1);
    expect(container.isInitialized('test')).toBe(true);
    expect(manager).toEqual({ value: 42 });

    // Accessing again should not re-initialize
    await container.get('test');
    expect(initCount).toBe(1);
  });

  it('should measure initialization time', async () => {
    const container = new LazyManagerContainer();
    
    container.register('slow-manager', async () => {
      // Simulate some initialization work
      await new Promise(resolve => setTimeout(resolve, 10));
      return { initialized: true };
    });

    const startTime = Date.now();
    await container.get('slow-manager');
    const initTime = Date.now() - startTime;

    console.log(`Manager initialization time: ${initTime}ms`);
    
    // Should complete quickly (< 100ms for this simple test)
    expect(initTime).toBeLessThan(100);
  });
});
