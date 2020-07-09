import CacheManager from 'cache-manager';
import RedisStore from 'cache-manager-redis';
import { config } from '../config';
import { GraphDump } from '../types/graphDump';
import { v4 as uuidv4 } from 'uuid';

const keys: string[] = [];

export const GraphCache = CacheManager.caching({
    store: config.cache.in_memory === true ? 'memory' : RedisStore,
    host: config.cache.redis.host,
    port: parseInt(config.cache.redis.port),
    password: config.cache.redis.password,
    db: 5,
    maxRetriesPerRequest: null,
    tls: config.cache.redis.tls ? {} : undefined,
    ttl: 60 * 60 * 24, // 24 hours cache
});

export function saveRun(payload: GraphDump): string {
    const key = uuidv4();
    payload.id = key;
    GraphCache.set(key, JSON.stringify(payload), {
        ttl: 12 * 60 * 60,
    });
    keys.push(key);
    return key;
}

export async function getAll(): Promise<GraphDump[]> {
    if (keys.length === 0) {
        return [];
    }

    let data = [];
    if (GraphCache.store.mget) {
        data = await GraphCache.store.mget(...keys);
    } else {
        return [];
    }

    data = data
        .map(JSON.parse)
        .filter((e: GraphDump | null) => e !== null)
        .filter((e: GraphDump) => 'id' in e);

    return data as GraphDump[];
}
