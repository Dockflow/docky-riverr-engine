import moment from 'moment';

import { EventAtLocationNode } from '../story-building/nodes/event-at-location-node';
import { SSEventNode } from '../story-building/nodes/ss-event-node';
import { TransportUnit } from '../types/docky-shipment-status-types';
import { ChangedETALogEntry, UOTMChangedETASegment } from '../types/uotm-changed-eta-segment';

export class ContainerMilestonesConcern {
    public static getSegments(cy: cytoscape.Core, tf_id: string): UOTMChangedETASegment[] {
        // For each TU that is handled in the story, we'll make a ContainerMileStoneSegment
        const transportUnits = EventAtLocationNode.all(cy).reduce((carry, item) => {
            if (carry.findIndex((e) => item.data.transport_unit && e.id === item.data.transport_unit.id) === -1) {
                carry.push(item.data.transport_unit);
            }
            return carry;
        }, [] as TransportUnit[]);

        return transportUnits
            .map((e) => ChangedETAConcern.getChangedETAs(e, cy))
            .filter((e) => e !== null) as UOTMChangedETASegment[];
    }
}
