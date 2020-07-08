import { Request, Response } from 'express';

import { ConcerningCore } from '../concerning/concerning-core';
import { saveRun } from '../core/cache';
import { StoryBuildingCore } from '../story-building/story-building-core';
import { GraphDump } from '../types/graphDump';

export class Orchestrator {
    public constructor() {
        //
    }

    public async execute(requestBody: { shipment_statuses: any[] }): Promise<void> {
        // Will first make the story
        const story = await new StoryBuildingCore().execute(requestBody.shipment_statuses);

        // Then we start concerning
        const concerns = await new ConcerningCore().execute(story, requestBody.shipment_statuses);

        // Then we save a dump to our database

        saveRun({
            graph_data: story,
            uotm_message: concerns,
            run_datetime: new Date().toISOString(),
            run_time: new Date().getTime(),
            tradeflow_id: concerns.tradeflow_id,
        } as GraphDump);
    }
}
