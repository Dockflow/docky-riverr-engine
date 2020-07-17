import { sha1 } from 'object-hash';

import { DockyShipmentStatus } from '../types/docky-shipment-status-types';
import { UOTMMessage } from '../types/uotm-message';
import { UOTMSegment } from '../types/uotm-segment';
import { ChangedETAConcern } from './changed-eta-concern';
import { ContainerMilestonesConcern } from './container-milestones-concern';

export class ConcerningCore {
    public async execute(cy: cytoscape.Core, shipmentStatuses: DockyShipmentStatus[]): Promise<UOTMMessage> {
        /**
         * Add the general header with identy-info
         */

        const id = shipmentStatuses.length > 0 ? shipmentStatuses[0].tradeflow_id.toString() : null;
        const segments: UOTMSegment[] = [];
        //segments.push(...DetentionDemurrageConcern.getSegments(cy, id));
        segments.push(...ContainerMilestonesConcern.getSegments(cy, id));
        segments.push(...ChangedETAConcern.getSegments(cy, id));

        const uotm = {
            tradeflow_id: id,
            segments: segments,
            hash: '--placeholder--',
        } as UOTMMessage;
        uotm.hash = sha1(uotm);
        return uotm;
    }
}
