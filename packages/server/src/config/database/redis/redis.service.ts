import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(key: string, value: string, ex?: 'EX', expireInSeconds?: number) {
    if (expireInSeconds) {
      await this.redis.set(key, value, ex, expireInSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async setex(key: string, expireInSeconds: number, value: string) {
    await this.redis.setex(key, expireInSeconds, value);
  }

  async exists(key: string) {
    return await this.redis.exists(key);
  }

  async get(key: string) {
    try {
      const data = await this.redis.get(key);
      return data;
    } catch (error) {
      console.log('error happened but i can handle it');
      return null;
    }
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async hset(hashKey: string, field: string, value: string) {
    await this.redis.hset(hashKey, field, value);
  }

  async hget(hashKey: string, field: string) {
    return await this.redis.hget(hashKey, field);
  }

  async hgetall(hashKey: string) {
    return await this.redis.hgetall(hashKey);
  }

  async hdel(hashKey: string, field: string) {
    await this.redis.hdel(hashKey, field);
  }

  async hsetWithExpire(hashKey: string, field: string, value: string, expireInSeconds: number) {
    await this.redis.hset(hashKey, field, value);
    await this.redis.expire(hashKey, expireInSeconds);
  }

  async zincrby(key: string, increment: number, member: string) {
    await this.redis.zincrby(key, increment, member);
  }

  async zrevrange(key: string, min: number, max: number) {
    return await this.redis.zrevrange(key, min, max, 'WITHSCORES');
  }

  async zrevrank(key: string, member: string) {
    return await this.redis.zrevrank(key, member);
  }

  async zscore(key: string, member: string) {
    return await this.redis.zscore(key, member);
  }

  async zcard(key: string) {
    return await this.redis.zcard(key);
  }

  async zrem(key: string, member: string) {
    await this.redis.zrem(key, member);
  }
}
