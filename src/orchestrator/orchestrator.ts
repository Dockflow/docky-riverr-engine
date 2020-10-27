import { ConcerningCore } from '../concerning/concerning-core';
import { saveRun } from '../core/cache';
import { StoryBuildingCore } from '../story-building/story-building-core';
import { ExecutionContext, RequestContext } from '../types/execution-context';
import { GraphDump } from '../types/graphDump';
import { UOTMMessage } from '../types/uotm-message';
import { config } from '../config';
import { logger } from '../core/logger';

export class Orchestrator {
    public async execute(requestBody: RequestContext): Promise<UOTMMessage> {
        const execContext: ExecutionContext = {
            ...requestBody,
            config: requestBody.config ?? config.default_configuration,
        };

        // Will first make the story
        let startTime = new Date();
        const cy = await new StoryBuildingCore().execute(execContext);
        this.logs('StoryBuildingCore', startTime, execContext.tradeflow_id);

        // Then we start concerning
        startTime = new Date();
        const concerns = await new ConcerningCore().execute(cy, execContext);
        this.logs('ConcerningCore', startTime, execContext.tradeflow_id);
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    logs(name: string, startTime: Date, id: string) {
        const stopTime = new Date();
        logger.debug({
            message: ` Time Interval for execute Core :  ${name}`,
            tradeflowId: id,
            startTime: startTime,
            stopTime: stopTime,
            duration: +(stopTime.getTime() - startTime.getTime()),
        });
    }
}
