import * as winston from 'winston';
import { config } from '../config';
import * as winstonlogzio from 'winston-logzio';

export const logger = winston.createLogger({
    level: 'debug',
    defaultMeta: {
        app: 'graphtp',
        environment: config.server.env,
    },
    transports: [],
});

if (config.logging.logzio.enabled === true) {
    const logzioWinstonTransport = new winstonlogzio.default({
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
