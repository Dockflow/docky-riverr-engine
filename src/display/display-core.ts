import { GraphyServer } from '../core/server';
import { GraphyServerPlugin } from '../types/graphyServerPlugin';
import express, { Request, Response } from 'express';
import { getAll, saveRun, GraphCache } from '../core/cache';
import { GraphDump } from '../types/graphDump';
export class DisplayCore implements GraphyServerPlugin {
    public run(server: GraphyServer): void {
        server.app.get('/list', this.list);
        server.app.get('/get', this.get);
        server.app.use(express.static('assets'));
    }

    private async list(req: Request, res: Response) {
        res.json(
            await (await getAll()).map((e) => {
                return { id: e.id, tradeflow_id: e.tradeflow_id, run_datetime: e.run_datetime };
            }),
        );
        res.end();
        return;
    }
    private async get(req: Request, res: Response) {
        if (!req.query.key || typeof req.query.key !== 'string') {
            res.status(400);
            res.end();
            return;
        }
        res.json(await GraphCache.get(req.query.key));
        res.end();
        return;
    }
}
