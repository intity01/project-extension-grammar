import * as extension from '../../src/extension';

describe('Extension', () => {
  it('should export activate function', () => {
    expect(typeof extension.activate).toBe('function');
  });

  it('should export deactivate function', () => {
    expect(typeof extension.deactivate).toBe('function');
  });
});
