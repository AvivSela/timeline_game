import { DatabaseServiceFactory } from '../services/DatabaseServiceFactory';
import { MockDatabaseService } from '../services/MockDatabaseService';
import { DatabaseService } from '../services/DatabaseService';
import { IDatabaseService } from '../services/IDatabaseService';

// Mock the console.log to avoid noise in tests
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('DatabaseServiceFactory', () => {
  beforeEach(() => {
    // Mock console.log
    console.log = mockConsoleLog;
    // Reset environment variables
    delete process.env.USE_MOCK_DB;
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
    // Clean up environment variables
    delete process.env.USE_MOCK_DB;
    // Clear mock calls
    jest.clearAllMocks();
  });

  describe('create()', () => {
    describe('when USE_MOCK_DB is set to "true"', () => {
      beforeEach(() => {
        process.env.USE_MOCK_DB = 'true';
      });

      it('should create a MockDatabaseService instance', () => {
        const service = DatabaseServiceFactory.create();
        
        expect(service).toBeInstanceOf(MockDatabaseService);
        expect(service).toHaveProperty('connect');
        expect(service).toHaveProperty('disconnect');
        expect(service).toHaveProperty('createGame');
        expect(service).toHaveProperty('findGameByRoomCode');
      });

      it('should log that mock database service is being used', () => {
        DatabaseServiceFactory.create();
        
        expect(mockConsoleLog).toHaveBeenCalledWith('Using mock database service');
        expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      });

      it('should implement IDatabaseService interface', () => {
        const service = DatabaseServiceFactory.create();
        
        // Verify it implements the interface by checking key methods
        expect(typeof service.connect).toBe('function');
        expect(typeof service.disconnect).toBe('function');
        expect(typeof service.createGame).toBe('function');
        expect(typeof service.findGameByRoomCode).toBe('function');
        expect(typeof service.addPlayerToGame).toBe('function');
        expect(typeof service.getRandomCards).toBe('function');
      });
    });

    describe('when USE_MOCK_DB is not set or set to "false"', () => {
      it('should create a DatabaseService instance when USE_MOCK_DB is not set', () => {
        const service = DatabaseServiceFactory.create();
        
        expect(service).toBeInstanceOf(DatabaseService);
        expect(service).toHaveProperty('connect');
        expect(service).toHaveProperty('disconnect');
        expect(service).toHaveProperty('createGame');
        expect(service).toHaveProperty('findGameByRoomCode');
      });

      it('should create a DatabaseService instance when USE_MOCK_DB is set to "false"', () => {
        process.env.USE_MOCK_DB = 'false';
        const service = DatabaseServiceFactory.create();
        
        expect(service).toBeInstanceOf(DatabaseService);
      });

      it('should log that real database service is being used', () => {
        DatabaseServiceFactory.create();
        
        expect(mockConsoleLog).toHaveBeenCalledWith('Using real database service');
        expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      });

      it('should implement IDatabaseService interface', () => {
        const service = DatabaseServiceFactory.create();
        
        // Verify it implements the interface by checking key methods
        expect(typeof service.connect).toBe('function');
        expect(typeof service.disconnect).toBe('function');
        expect(typeof service.createGame).toBe('function');
        expect(typeof service.findGameByRoomCode).toBe('function');
        expect(typeof service.addPlayerToGame).toBe('function');
        expect(typeof service.getRandomCards).toBe('function');
      });
    });

    describe('when USE_MOCK_DB is set to other values', () => {
      it('should create a DatabaseService instance when USE_MOCK_DB is set to "FALSE"', () => {
        process.env.USE_MOCK_DB = 'FALSE';
        const service = DatabaseServiceFactory.create();
        
        expect(service).toBeInstanceOf(DatabaseService);
      });

      it('should create a DatabaseService instance when USE_MOCK_DB is set to "0"', () => {
        process.env.USE_MOCK_DB = '0';
        const service = DatabaseServiceFactory.create();
        
        expect(service).toBeInstanceOf(DatabaseService);
      });

      it('should create a DatabaseService instance when USE_MOCK_DB is set to empty string', () => {
        process.env.USE_MOCK_DB = '';
        const service = DatabaseServiceFactory.create();
        
        expect(service).toBeInstanceOf(DatabaseService);
      });
    });

    describe('return value consistency', () => {
      it('should return the same type of service for multiple calls with same environment', () => {
        const service1 = DatabaseServiceFactory.create();
        const service2 = DatabaseServiceFactory.create();
        
        expect(service1.constructor).toBe(service2.constructor);
      });

      it('should return different types when environment changes between calls', () => {
        // First call without USE_MOCK_DB
        const service1 = DatabaseServiceFactory.create();
        
        // Second call with USE_MOCK_DB=true
        process.env.USE_MOCK_DB = 'true';
        const service2 = DatabaseServiceFactory.create();
        
        expect(service1.constructor).not.toBe(service2.constructor);
        expect(service1).toBeInstanceOf(DatabaseService);
        expect(service2).toBeInstanceOf(MockDatabaseService);
      });
    });

    describe('static method behavior', () => {
      it('should be a static method', () => {
        expect(typeof DatabaseServiceFactory.create).toBe('function');
        expect(DatabaseServiceFactory.create).toBeDefined();
      });

      it('should not require instantiation of DatabaseServiceFactory', () => {
        // Should work without creating an instance
        const service = DatabaseServiceFactory.create();
        expect(service).toBeDefined();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined environment variable gracefully', () => {
      process.env.USE_MOCK_DB = undefined as any;
      const service = DatabaseServiceFactory.create();
      
      expect(service).toBeInstanceOf(DatabaseService);
    });

    it('should handle null environment variable gracefully', () => {
      process.env.USE_MOCK_DB = null as any;
      const service = DatabaseServiceFactory.create();
      
      expect(service).toBeInstanceOf(DatabaseService);
    });

    it('should be case sensitive for "true" value', () => {
      process.env.USE_MOCK_DB = 'TRUE';
      const service = DatabaseServiceFactory.create();
      
      expect(service).toBeInstanceOf(DatabaseService);
    });
  });
}); 