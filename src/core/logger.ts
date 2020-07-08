import * as winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
    level: 'debug',
    defaultMeta: {
        app: 'docky-scraper',
        environment: config.server.env,
    },
    transports: [],
});

if (config.logging.logzio.enabled === true) {
    // eslint-disable-next-line
    const LogzioWinstonTransport = require('winston-logzio');

    const logzioWinstonTransport = new LogzioWinstonTransport({
        name: 'winston_logzio',
        host: 'listener-nl.logz.io',
        token: config.logging.logzio.token,
        level: 'debug',
    });
    logger.add(logzioWinstonTransport);
    logger.debug('Added LogzIO logger.');
} else {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    );
    logger.add(new winston.transports.File({ filename: 'logs/logs.log' }));
}

process.on('warning', (e) => logger.debug(e.message + ' ' + e.stack?.substr(0, 1000)));
