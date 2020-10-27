import { sha1 } from 'object-hash';

import { ExecutionContext } from '../types/execution-context';
import { UOTMMessage } from '../types/uotm-message';
import { UOTMSegment } from '../types/uotm-segment';
import { ContainerMilestonesConcern } from './container-milestones-concern';
import { ChangedETAConcern } from './changed-eta/changed-eta-concern';
import { TPGeneration } from './tp-generation/tp-generation-concern';
import { logger } from '../core/logger';

export class ConcerningCore {
    public async execute(cy: cytoscape.Core, execContext: ExecutionContext): Promise<UOTMMessage> {
        /**
         * Add the general header with identy-info
         */
        const segments: UOTMSegment[] = [];

        // Dirty-fix the tradeflow-id
        if (!execContext.tradeflow_id) {
            execContext.tradeflow_id = execContext.shipment_statuses.reduce((carry, item) => {
                return item.tradeflow_id.toString();
            }, '');
        }

        //segments.push(...DetentionDemurrageConcern.getSegments(cy, id));
        segments.push(...ContainerMilestonesConcern.getSegments(cy, execContext));
        segments.push(...ChangedETAConcern.getSegments(cy, execContext));

        const startTime = new Date();
        segments.push(...TPGeneration.getSegments(cy));
        this.logs('TPGeneration', startTime, execContext.tradeflow_id);

        const uotm = {
            tradeflow_id: execContext.tradeflow_id,
            segments: segments,
            hash: '--placeholder--',
        } as UOTMMessage;
        uotm.hash = sha1(uotm);
        return uotm;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    logs(name: string, startTime: Date, id: string) {
        const stopTime = new Date();
        logger.debug({
            message: ` Time Interval for execute Function :  ${name}`,
            tradeflowId: id,
            startTime: startTime,
            stopTime: stopTime,
            duration: +(stopTime.getTime() - startTime.getTime()),
        });
    }
}
