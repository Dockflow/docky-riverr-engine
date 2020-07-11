import { EventAtLocationNode } from '../story-building/nodes/event-at-location-node';
import { TransportUnit } from '../types/docky-shipment-status-types';
import { UOTMChangedETASegment, ChangedETALogEntry } from '../types/uotm-changed-eta-segment';
import { SSEventNode } from '../story-building/nodes/ss-event-node';
import moment from 'moment';

export class ChangedETAConcern {
    public static getSegments(cy: cytoscape.Core, tf_id: string): UOTMChangedETASegment[] {
        // For each TU that is handled in the story, we'll make a TUDDCondition
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

    public static getChangedETAs(tu: TransportUnit, cy: cytoscape.Core): UOTMChangedETASegment | null {
        let lastPredicted: string | null = null;
        const lastVAEALN = EventAtLocationNode.all(cy)
            .filter((e) => e.data.transport_unit.id === tu.id)
            .filter((e) => e.data.status_code.status_code === 'VA')
            .filter((e) => {
                // It cannot have other VA's down the line
                return e.streamNodes('down').findIndex((e) => e.data.status_code.status_code === 'VA') === -1;
            })
            .pop();

        if (!lastVAEALN) {
            return null;
        }

        const log = lastVAEALN
            .getIncomingSSEventNodeIds()
            .map((e) => new SSEventNode({ data: cy.$id(e).data() }, cy))
            .reduce((carry, item) => {
                if (!lastPredicted) {
                    lastPredicted = item.data.shipment_status.event_date;
                }
                if (lastPredicted && lastPredicted !== item.data.shipment_status.event_date) {
                    carry.push({
                        previous: lastPredicted,
                        new: item.data.shipment_status.event_date,
                    });
                    lastPredicted = item.data.shipment_status.event_date;
                }
                return carry;
            }, [] as ChangedETALogEntry[]);

        if (log.length === 0) {
            return null;
        }

        const lowestDate: moment.Moment = log
            .reduce((carry, item) => {
                carry.push(moment(item.new.toString()));
                carry.push(moment(item.previous));
                return carry;
            }, [] as moment.Moment[])
            .reduce((carry, item) => {
                if (carry == null) {
                    return item;
                }
                return carry > item ? carry : item;
            });
        const highestDate: moment.Moment = log
            .reduce((carry, item) => {
                carry.push(moment(item.new.toString()));
                carry.push(moment(item.previous));
                return carry;
            }, [] as moment.Moment[])
            .reduce((carry, item) => {
                if (carry == null) {
                    return item;
                }
                return carry < item ? carry : item;
            });

        const alert = Math.abs(highestDate.diff(lowestDate, 'hours')) > 8;
        if (!alert) {
            return null;
        }

        return {
            type: 'ChangedETA',
            alert: alert,
            log: log,
            transport_unit: tu,
        };
    }
}