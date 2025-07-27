import { IDatabaseService } from './IDatabaseService';
import { DatabaseService } from './DatabaseService';
import { MockDatabaseService } from './MockDatabaseService';

export class DatabaseServiceFactory {
  static create(): IDatabaseService {
    const useMockDb = process.env.USE_MOCK_DB === 'true';
    
    if (useMockDb) {
      console.log('Using mock database service');
      return new MockDatabaseService();
    } else {
      console.log('Using real database service');
      return new DatabaseService();
    }
  }
} 