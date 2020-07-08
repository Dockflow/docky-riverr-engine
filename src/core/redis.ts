import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { config } from '../config';

let _redis;

if (config.cache.in_memory === true) {
    _redis = new RedisMock();
} else {
    _redis = new Redis({
        host: config.cache.redis.host,
        port: parseInt(config.cache.redis.port),
        password: config.cache.redis.password,
        db: 5,
        maxRetriesPerRequest: null,
        tls: config.cache.redis.tls ? {} : undefined,
    });
}

export const redis = _redis;
