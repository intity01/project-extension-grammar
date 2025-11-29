/**
 * Performance test for debouncing utilities
 * Verifies debouncing reduces excessive operations
 */

import { debounce, throttle } from '../../src/utils/debounce';

describe('Performance: Debouncing', () => {
  describe('Debounce Function', () => {
    it('should delay function execution', (done) => {
      let callCount = 0;
      const fn = () => { callCount++; };
      const debouncedFn = debounce(fn, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(callCount).toBe(0);

      // Wait for debounce delay
      setTimeout(() => {
        // Should have been called only once
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should reset timer on subsequent calls', (done) => {
      let callCount = 0;
      const fn = () => { callCount++; };
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      
      setTimeout(() => {
        debouncedFn(); // Reset timer
      }, 50);

      setTimeout(() => {
        // Should not have been called yet (timer was reset)
        expect(callCount).toBe(0);
      }, 120);

      setTimeout(() => {
        // Should have been called once after final delay
        expect(callCount).toBe(1);
        done();
      }, 250); // Increased timeout to ensure debounce completes
    }, 10000); // Increased test timeout

    it('should reduce validation calls during rapid changes', (done) => {
      let validationCount = 0;
      const validate = () => {
        validationCount++;
        console.log(`Validation called: ${validationCount}`);
      };

      const debouncedValidate = debounce(validate, 500);

      // Simulate rapid file changes (10 changes in 100ms)
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          debouncedValidate();
        }, i * 10);
      }

      // After all rapid changes
      setTimeout(() => {
        // Should have been called only once
        expect(validationCount).toBe(1);
        console.log(`Total validations: ${validationCount} (reduced from 10)`);
        done();
      }, 700);
    });

    it('should preserve function context', (done) => {
      const obj = {
        value: 42,
        getValue: function() {
          return this.value;
        }
      };

      const debouncedGetValue = debounce(function(this: typeof obj) {
        expect(this.value).toBe(42);
        done();
      }, 50);

      debouncedGetValue.call(obj);
    });
  });

  describe('Throttle Function', () => {
    it('should limit function calls', (done) => {
      let callCount = 0;
      const fn = () => { callCount++; };
      const throttledFn = throttle(fn, 100);

      // Call multiple times rapidly
      throttledFn(); // Should execute
      throttledFn(); // Should be throttled
      throttledFn(); // Should be throttled

      // Should have been called only once immediately
      expect(callCount).toBe(1);

      // Wait for throttle period
      setTimeout(() => {
        throttledFn(); // Should execute again
        expect(callCount).toBe(2);
        done();
      }, 150);
    });

    it('should allow calls after throttle period', (done) => {
      let callCount = 0;
      const fn = () => { callCount++; };
      const throttledFn = throttle(fn, 50);

      throttledFn(); // Call 1
      expect(callCount).toBe(1);

      setTimeout(() => {
        throttledFn(); // Call 2 (after throttle period)
        expect(callCount).toBe(2);
        done();
      }, 100);
    });

    it('should reduce scroll event handlers', (done) => {
      let handleCount = 0;
      const handleScroll = () => {
        handleCount++;
      };

      const throttledScroll = throttle(handleScroll, 100);

      // Simulate rapid scroll events (20 events in 50ms)
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          throttledScroll();
        }, i * 2);
      }

      setTimeout(() => {
        // Should have been called much less than 20 times
        console.log(`Scroll handlers: ${handleCount} (reduced from 20)`);
        expect(handleCount).toBeLessThan(5);
        done();
      }, 200);
    });
  });

  describe('Performance Comparison', () => {
    it('should demonstrate performance improvement with debouncing', (done) => {
      let normalCallCount = 0;
      let debouncedCallCount = 0;

      const normalFn = () => { normalCallCount++; };
      const debouncedFn = debounce(() => { debouncedCallCount++; }, 100);

      // Simulate 100 rapid calls
      for (let i = 0; i < 100; i++) {
        normalFn();
        debouncedFn();
      }

      setTimeout(() => {
        console.log(`Normal calls: ${normalCallCount}, Debounced calls: ${debouncedCallCount}`);
        expect(normalCallCount).toBe(100);
        expect(debouncedCallCount).toBe(1);
        
        // Debouncing reduced calls by 99%
        const reduction = ((normalCallCount - debouncedCallCount) / normalCallCount) * 100;
        console.log(`Performance improvement: ${reduction}% reduction in calls`);
        expect(reduction).toBeGreaterThan(90);
        done();
      }, 200);
    });
  });
});
