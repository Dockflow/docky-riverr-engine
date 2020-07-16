import { Request, Response } from 'express';

import { GraphyServer } from '../core/server';
import { Orchestrator } from '../orchestrator/orchestrator';
import { GraphyServerPlugin } from '../types/graphyServerPlugin';

export class InfluxCore implements GraphyServerPlugin {
    public run(server: GraphyServer): void {
        server.app.post('/request-uotm-message', this.execute);
    }

    private async execute(req: Request, res: Response): Promise<void> {
        new Orchestrator()
            .execute(req.body)
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
            });
        return;
    }
}
