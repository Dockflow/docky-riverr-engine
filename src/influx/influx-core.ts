import { Request, Response } from 'express';

import { GraphyServer } from '../core/server';
import { Orchestrator } from '../orchestrator/orchestrator';
import { GraphyServerPlugin } from '../types/graphyServerPlugin';
import * as fs from 'fs';

export class InfluxCore implements GraphyServerPlugin {
    public run(server: GraphyServer): void {
        server.app.post('/request-uotm-message', this.execute);
    }

    private async execute(req: Request, res: Response): Promise<void> {
        fs.writeFileSync('test_ss_.txt', JSON.stringify(req.body));

        new Orchestrator()
            .execute(req.body)
            .then((result) => {
                res.json(true);
                res.status(500);
                res.end();
            })
            .catch((e) => {
                res.json(false);
                res.status(500);
                res.end();
            });
        return;
    }
}
