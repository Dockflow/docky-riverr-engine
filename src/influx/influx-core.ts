import { Request, Response } from 'express';
import { logger } from '../core/logger';

import { GraphyServer } from '../core/server';
import { Orchestrator } from '../orchestrator/orchestrator';
import { RequestContext } from '../types/execution-context';
import { GraphyServerPlugin } from '../types/graphyServerPlugin';

export class InfluxCore implements GraphyServerPlugin {
    public run(server: GraphyServer): void {
        server.app.post('/request-uotm-message', this.execute);
    }

    private async execute(req: Request, res: Response): Promise<void> {
        const startTime = new Date();
        logger.debug({
            message: 'Started executing GraphTP cycle',
            tradeflowId: (req.body as RequestContext).tradeflow_id,
            startTime: startTime,
        });
        const interval = setInterval(() => {
            logger.debug({
                message: 'Long GraphTP cycle ping',
                tradeflowId: (req.body as RequestContext).tradeflow_id,
                startTime: startTime,
            });
        }, 5000);
        new Orchestrator()
            .execute(req.body as RequestContext)
            .then((result) => {
                res.json(result);
                res.status(200);
                res.end();
            })
            .catch((e) => {
                res.json(false);
                console.log('error', e);
                res.status(500);
                res.end();
            })
            .finally(() => {
                clearInterval(interval);
                const stopTime = new Date();
                logger.debug({
                    message: 'Stopped executing GraphTP cycle',
                    tradeflowId: (req.body as RequestContext).tradeflow_id,
                    startTime: startTime,
                    stopTime: stopTime,
                    duration: +(stopTime.getTime() - startTime.getTime()),
                });
            });
        return;
    }
}
