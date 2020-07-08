import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import express, { Application } from 'express';
import { Server } from 'http';

import { config } from '../config';
import { logger } from './logger';
import { GraphyServerPlugin } from '../types/graphyServerPlugin';
import { Type } from '../types/type';

export class GraphyServer {
    public app: Application;
    private httpServer: Server;

    public constructor() {
        logger.debug('Starting server...');

        const app: Application = express();
        const corsOption: CorsOptions = {
            preflightContinue: true,

            origin: (origin, callback) => {
                callback(null, true);
            },
        };
        this.httpServer = new Server(app).listen(config.server.port);
        app.use(bodyParser.json({ limit: '2048mb' }));
        app.use(cors(corsOption));

        this.app = app;

        logger.debug('HTTP Server started at port ' + config.server.port);

        // Actual exit of process on uncaught rejection
        process.on('unhandledRejection', function (err) {
            try {
                logger.warning(new Date().toUTCString() + ' uncaughtException:');
            } catch (e) {
                //
            }
            console.error(new Date().toUTCString() + ' unhandledRejection:', err);
            console.error(err);
            process.exit(1);
        });
        // Actual exit of process on uncaught error
        process.on('uncaughtException', function (err) {
            try {
                logger.warning(new Date().toUTCString() + ' uncaughtException:', err.message);
            } catch (e) {
                //
            }
            console.error(new Date().toUTCString() + ' uncaughtException:', err.message);
            console.error(err.stack);
            process.exit(1);
        });
    }

    public register(plugin: Type<GraphyServerPlugin>): void {
        const pl = new plugin();
        pl.run(this);
    }

    public close(): void {
        this.httpServer.close();
    }
}
