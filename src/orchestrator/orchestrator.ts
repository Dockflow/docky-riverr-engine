import { Request, Response } from 'express';

import { ConcerningCore } from '../concerning/concerning-core';
import { saveRun } from '../core/cache';
import { StoryBuildingCore } from '../story-building/story-building-core';
import { GraphDump } from '../types/graphDump';
import { UOTMMessage } from '../types/uotm-message';

export class Orchestrator {
    public constructor() {
        //
    }

    public async execute(requestBody: { shipment_statuses: any[] }): Promise<UOTMMessage> {
        // Will first make the story
        const cy = await new StoryBuildingCore().execute(requestBody.shipment_statuses);

        // Then we start concerning
        const concerns = await new ConcerningCore().execute(cy, requestBody.shipment_statuses);

        // Then we save a dump to our database

        saveRun({
            graph_data: cy.json(),
            uotm_message: concerns,
            run_datetime: new Date().toISOString(),
            run_time: new Date().getTime(),
            tradeflow_id: concerns.tradeflow_id,
        } as GraphDump);

        return concerns;
    }
}
