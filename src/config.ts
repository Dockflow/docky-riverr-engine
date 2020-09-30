import dotenv from 'dotenv';
import { ExecutionConfiguration } from './types/execution-configuration';
dotenv.config();

export const config = {
    server: {
        env: process.env.NODE_ENV || 'test',
        port: process.env.PORT || 8223,
    },
    logging: {
        data_quality_logging: process.env.DATA_QUALITY_LOGGING || true,
        logzio: {
            enabled: process.env.LOGZIO_ENABLED?.toLowerCase() == 'true' ? true : false || false,
            token: process.env.LOGZIO_API_TOKEN || '',
        },
    },
    cache: {
        in_memory: process.env.CACHE_IN_MEMORY?.toLowerCase() === 'false' ? false : true || true,
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || '6380',
            password: process.env.REDIS_PASSWORD || undefined,
            tls:
                typeof process.env.REDIS_TLS !== 'undefined' &&
                (process.env.REDIS_TLS.toLowerCase() == 'true' || process.env.REDIS_TLS.toLowerCase() === '1')
                    ? true
                    : false,
        },
    },
    default_configuration: {} as ExecutionConfiguration,
};
