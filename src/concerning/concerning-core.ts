import { sha1 } from 'object-hash';

import { ExecutionContext } from '../types/execution-context';
import { UOTMMessage } from '../types/uotm-message';
import { UOTMSegment } from '../types/uotm-segment';
import { ContainerMilestonesConcern } from './container-milestones-concern';
import { ChangedETAConcern } from './changed-eta/changed-eta-concern';

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

        const uotm = {
            tradeflow_id: execContext.tradeflow_id,
            segments: segments,
            hash: '--placeholder--',
        } as UOTMMessage;
        uotm.hash = sha1(uotm);
        return uotm;
    }
}
