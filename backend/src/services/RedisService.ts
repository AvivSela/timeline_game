import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Game state caching
  async cacheGameState(roomCode: string, gameState: any, ttl: number = 3600): Promise<void> {
    await this.connect();
    const key = `game:${roomCode}:state`;
    await this.client.setEx(key, ttl, JSON.stringify(gameState));
  }

  async getGameState(roomCode: string): Promise<any | null> {
    await this.connect();
    const key = `game:${roomCode}:state`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteGameState(roomCode: string): Promise<void> {
    await this.connect();
    const key = `game:${roomCode}:state`;
    await this.client.del(key);
  }

  // Player session management
  async setPlayerSession(playerId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    await this.connect();
    const key = `player:${playerId}:session`;
    await this.client.setEx(key, ttl, JSON.stringify(sessionData));
  }

  async getPlayerSession(playerId: string): Promise<any | null> {
    await this.connect();
    const key = `player:${playerId}:session`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deletePlayerSession(playerId: string): Promise<void> {
    await this.connect();
    const key = `player:${playerId}:session`;
    await this.client.del(key);
  }

  // Room code management
  async setRoomCode(roomCode: string, gameId: string, ttl: number = 3600): Promise<void> {
    await this.connect();
    const key = `room:${roomCode}`;
    await this.client.setEx(key, ttl, gameId);
  }

  async getRoomCode(roomCode: string): Promise<string | null> {
    await this.connect();
    const key = `room:${roomCode}`;
    return await this.client.get(key);
  }

  async deleteRoomCode(roomCode: string): Promise<void> {
    await this.connect();
    const key = `room:${roomCode}`;
    await this.client.del(key);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number }> {
    await this.connect();
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, window);
    }

    const remaining = Math.max(0, limit - current);
    return {
      allowed: current <= limit,
      remaining
    };
  }

  // Game statistics caching
  async cacheGameStats(stats: any, ttl: number = 300): Promise<void> {
    await this.connect();
    const key = 'stats:games';
    await this.client.setEx(key, ttl, JSON.stringify(stats));
  }

  async getGameStats(): Promise<any | null> {
    await this.connect();
    const key = 'stats:games';
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Player presence tracking
  async setPlayerPresence(roomCode: string, playerId: string, ttl: number = 60): Promise<void> {
    await this.connect();
    const key = `presence:${roomCode}:${playerId}`;
    await this.client.setEx(key, ttl, Date.now().toString());
  }

  async getPlayerPresence(roomCode: string, playerId: string): Promise<number | null> {
    await this.connect();
    const key = `presence:${roomCode}:${playerId}`;
    const data = await this.client.get(key);
    return data ? parseInt(data) : null;
  }

  async removePlayerPresence(roomCode: string, playerId: string): Promise<void> {
    await this.connect();
    const key = `presence:${roomCode}:${playerId}`;
    await this.client.del(key);
  }

  async getActivePlayersInRoom(roomCode: string): Promise<string[]> {
    await this.connect();
    const pattern = `presence:${roomCode}:*`;
    const keys = await this.client.keys(pattern);
    return keys.map(key => key.split(':')[2]);
  }

  // Cache invalidation
  async invalidateGameCache(roomCode: string): Promise<void> {
    await this.connect();
    const pattern = `game:${roomCode}:*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async invalidatePlayerCache(playerId: string): Promise<void> {
    await this.connect();
    const pattern = `player:${playerId}:*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  // Health check
  async ping(): Promise<string> {
    await this.connect();
    return await this.client.ping();
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export a singleton instance
export const redisService = new RedisService(); 