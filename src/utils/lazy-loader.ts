/**
 * Lazy loading utility for performance optimization
 * Loads components only when they are first accessed
 */

import { createLogger } from './logger';

const logger = createLogger('LazyLoader');

/**
 * Lazy loader class that initializes a value only when first accessed
 */
export class LazyLoader<T> {
  private _value: T | undefined;
  private _initializer: () => T | Promise<T>;
  private _isInitialized = false;
  private _isInitializing = false;
  private _initPromise: Promise<T> | undefined;

  constructor(initializer: () => T | Promise<T>) {
    this._initializer = initializer;
  }

  /**
   * Gets the value, initializing it if necessary
   */
  async get(): Promise<T> {
    if (this._isInitialized && this._value !== undefined) {
      return this._value;
    }

    if (this._isInitializing && this._initPromise) {
      return this._initPromise;
    }

    this._isInitializing = true;
    this._initPromise = this.initialize();

    try {
      this._value = await this._initPromise;
      this._isInitialized = true;
      return this._value;
    } finally {
      this._isInitializing = false;
      this._initPromise = undefined;
    }
  }

  /**
   * Gets the value synchronously if already initialized
   */
  getSync(): T | undefined {
    return this._value;
  }

  /**
   * Checks if the value has been initialized
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Resets the lazy loader, forcing re-initialization on next access
   */
  reset(): void {
    this._value = undefined;
    this._isInitialized = false;
    this._isInitializing = false;
    this._initPromise = undefined;
  }

  /**
   * Initializes the value
   */
  private async initialize(): Promise<T> {
    logger.debug('Initializing lazy-loaded component');
    const result = this._initializer();
    
    if (result instanceof Promise) {
      return await result;
    }
    
    return result;
  }
}

/**
 * Creates a lazy loader for a component
 */
export function createLazyLoader<T>(initializer: () => T | Promise<T>): LazyLoader<T> {
  return new LazyLoader(initializer);
}

/**
 * Lazy manager container that holds multiple lazy-loaded managers
 */
export class LazyManagerContainer {
  private managers: Map<string, LazyLoader<any>> = new Map();

  /**
   * Registers a lazy-loaded manager
   */
  register<T>(name: string, initializer: () => T | Promise<T>): void {
    this.managers.set(name, new LazyLoader(initializer));
  }

  /**
   * Gets a manager by name, initializing it if necessary
   */
  async get<T>(name: string): Promise<T | undefined> {
    const loader = this.managers.get(name);
    if (!loader) {
      logger.warn(`Manager not found: ${name}`);
      return undefined;
    }
    return await loader.get();
  }

  /**
   * Gets a manager synchronously if already initialized
   */
  getSync<T>(name: string): T | undefined {
    const loader = this.managers.get(name);
    if (!loader) {
      return undefined;
    }
    return loader.getSync();
  }

  /**
   * Checks if a manager is initialized
   */
  isInitialized(name: string): boolean {
    const loader = this.managers.get(name);
    return loader ? loader.isInitialized() : false;
  }

  /**
   * Resets a manager, forcing re-initialization on next access
   */
  reset(name: string): void {
    const loader = this.managers.get(name);
    if (loader) {
      loader.reset();
    }
  }

  /**
   * Resets all managers
   */
  resetAll(): void {
    for (const loader of this.managers.values()) {
      loader.reset();
    }
  }

  /**
   * Gets all registered manager names
   */
  getManagerNames(): string[] {
    return Array.from(this.managers.keys());
  }
}
