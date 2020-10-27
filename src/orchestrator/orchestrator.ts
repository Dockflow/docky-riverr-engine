import { ConcerningCore } from '../concerning/concerning-core';
import { saveRun } from '../core/cache';
import { StoryBuildingCore } from '../story-building/story-building-core';
import { ExecutionContext, RequestContext } from '../types/execution-context';
import { GraphDump } from '../types/graphDump';
import { UOTMMessage } from '../types/uotm-message';
import { config } from '../config';

export class Orchestrator {
    public async execute(requestBody: RequestContext): Promise<UOTMMessage> {
        const execContext: ExecutionContext = {
            ...requestBody,
            config: requestBody.config ?? config.default_configuration,
        };

        // Will first make the story
        const cy = await new StoryBuildingCore().execute(execContext);

        // Then we start concerning
        const concerns = await new ConcerningCore().execute(cy, execContext);
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
