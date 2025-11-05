// Test setup file for Bun
import 'reflect-metadata';

// Global test configuration
globalThis.console = console;

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

export {};
