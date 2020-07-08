import { GraphyServer } from '../core/server';
import { GraphyServerPlugin } from '../types/graphyServerPlugin';
import express, { Request, Response } from 'express';
import { getAll, saveRun, GraphCache } from '../core/cache';
import { GraphDump } from '../types/graphDump';
import cytoscape, { NodeDefinition, EdgeDefinition } from 'cytoscape';
import e from 'express';

export class DisplayCore implements GraphyServerPlugin {
    public run(server: GraphyServer): void {
        const cy = cytoscape();

        cy.add({
            grabbable: true,

            data: { id: 'b', name: 'BEANR' },
        } as NodeDefinition);

        cy.add({
            grabbable: true,

            data: { id: 'm', name: 'INMUM' },
        } as NodeDefinition);

        cy.add({
            grabbable: true,

            data: { id: 'd', name: 'Gate In', parent: 'b' },
        } as NodeDefinition);
        cy.add({
            grabbable: true,
            data: { id: 'e', name: 'Loaded', parent: 'b' },
        } as NodeDefinition);
        cy.add({
            grabbable: true,
            data: { id: 'f', name: 'Loaded-2', parent: 'b' },
        } as NodeDefinition);
        cy.add({
            grabbable: true,
            data: { id: 'ee', name: 'Loaded', parent: 'm' },
        } as NodeDefinition);
        cy.add({
            grabbable: true,
            data: { id: 'ff', name: 'Loaded-2', parent: 'm' },
        } as NodeDefinition);
        cy.add({
            data: {
                source: 'd',
                target: 'e',
            },
        } as EdgeDefinition);
        cy.add({
            data: {
                source: 'd',
                target: 'f',
            },
        } as EdgeDefinition);
        cy.add({
            data: {
                source: 'b',
                target: 'm',
            },
        } as EdgeDefinition);
        cy.add({
            data: {
                source: 'ee',
                target: 'ff',
            },
        } as EdgeDefinition);
        cy.add({
            data: {
                source: 'f',
                target: 'ee',
            },
        } as EdgeDefinition);

        saveRun({
            graph_data: cy.json(),
            uotm_message: {
                somekey: 'someValue',
            },
        } as GraphDump);
        server.app.get('/list', this.list);
        server.app.get('/get', this.get);
        server.app.use(express.static('assets'));
    }

    private async list(req: Request, res: Response) {
        res.json(
            await (await getAll()).map((e) => {
                return { id: e.id };
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
