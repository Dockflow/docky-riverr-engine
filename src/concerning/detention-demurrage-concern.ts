import { EventAtLocationNode } from '../story-building/nodes/event-at-location-node';
import { TransportUnit } from '../types/docky-shipment-status-types';
import { UOTMTUDDSegment } from '../types/uotm-tudd-segment';

export class DetentionDemurrageConcern {
    public static getSegments(cy: cytoscape.Core, tf_id: string): UOTMTUDDSegment[] {
        // For each TU that is handled in the story, we'll make a TUDDCondition
        const transportUnits = EventAtLocationNode.all(cy).reduce((carry, item) => {
            if (carry.findIndex((e) => item.data.transport_unit && e.id === item.data.transport_unit.id) === -1) {
                carry.push(item.data.transport_unit);
            }
            return carry;
        }, [] as TransportUnit[]);

        return transportUnits.map((e) => DetentionDemurrageConcern.getTUDDCondition(e, tf_id, cy));
    }

    public static getTUDDCondition(tu: TransportUnit, tf_id: string, _cy: cytoscape.Core): UOTMTUDDSegment {
        return {
            type: 'TUDD',
            tf_id: tf_id,
            tu_id: tu.id.toString(),
            tu_reference: tu.reference,
        };
    }
}
