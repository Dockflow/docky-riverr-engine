import cytoscape from 'cytoscape';
import moment, { Moment } from 'moment';
import hash from 'object-hash';

import { EventAtLocationNode } from '../../story-building/nodes/event-at-location-node';
import { SSEventNode } from '../../story-building/nodes/ss-event-node';
import { TransportUnit } from '../../types/docky-shipment-status-types';
import { ExecutionContext } from '../../types/execution-context';
import { ChangedETALogEntry, UOTMChangedETASegment } from '../../types/uotm-changed-eta-segment';

export class ChangedETAConcern {
    public static getETALogEntries(cy: cytoscape.Core, VAEvent: EventAtLocationNode): ChangedETALogEntry[] {
        const VDEvent = this.getVesselDepartureEvent(VAEvent.data.transport_unit, cy);
        // console.log('VA was at', VAEvent?.data.message ?? 'not set');
        // console.log('VD was at', VDEvent?.data.event_date ?? 'not set');

        const logs = (VAEvent as EventAtLocationNode)
            .getIncomingSSEventNodeIds()
            .map((e) => {
                return new SSEventNode({ data: cy.$id(e).data() }, cy);
            })
            .sort((a, b) => {
                return +moment(a.data.shipment_status.created_at) - +moment(b.data.shipment_status.created_at);
            })
            .reduce(
                (carry, item) => {
                    // console.log('checking event created at ', item.data.shipment_status.created_at);
                    if (carry.init_date && !carry.init_date.isSame(moment(item.data.shipment_status.event_date))) {
                        const isBeforeVesselDeparture = VDEvent
                            ? moment(item.data.shipment_status.created_at).isBefore(VDEvent.data.event_date)
                            : true;
                        carry.entries.push({
                            previous_reading: carry.init_date.toISOString(),
                            reading: item.data.shipment_status.event_date,
                            event_date: item.data.shipment_status.created_at,
                            in_transit_change: !isBeforeVesselDeparture,
                            hash: '',
                            valid_until: moment().toString(), // placeholder,
                        });
                    }
                    if (carry.max_date) {
                        carry.max_date = moment.max(moment(item.data.shipment_status.event_date), carry.max_date);
                    } else {
                        carry.max_date = moment(item.data.shipment_status.event_date);
                    }
                    carry.init_date = moment(item.data.shipment_status.event_date);
                    return carry;
                },
                {
                    entries: [] as ChangedETALogEntry[],
                    max_date: null as Moment | null,
                    init_date: null as Moment | null,
                },
            );

        logs.entries.map((e, i) => {
            if (e.in_transit_change && logs.max_date) {
                e.valid_until = logs.max_date?.toISOString();
            } else {
                e.valid_until = VDEvent?.data.event_date ?? moment().add(1, 'weeks').toISOString();
            }
            e.hash = hash(i + '-' + +moment(e.previous_reading) + '-' + +moment(e.reading));
            return e;
        });

        return logs.entries;
    }

    /**
     * This function will return the VA event, or the first event at the last location, if no VA was found
     * @param tu The TU to look for
     * @param cy The story
     */
    public static getVesselArrivalEvent(tu: TransportUnit, cy: cytoscape.Core): EventAtLocationNode | null {
        const latestVA =
            EventAtLocationNode.all(cy)
                .filter((e) => e.data.transport_unit.id === tu.id)
                .filter((e) => e.data.status_code && e.data.status_code.status_code == 'VA')
                .sort((event1, event2) => {
                    return +moment(event1.data.event_date) - +moment(event2.data.event_date);
                })
                .pop() ?? null;
        if (latestVA) {
            return latestVA;
        }

        // Check for first event at last location if no VA

        const multipleLocationsInvolved = EventAtLocationNode.all(cy)
            .filter((e) => e.data.transport_unit.id === tu.id)
            .sort((event1, event2) => {
                return +moment(event1.data.event_date) - +moment(event2.data.event_date);
            })
            .reduce(
                (carry, item) => {
                    if (!item.data.location) {
                        return carry;
                    }
                    if (carry.location_id !== 0 && item.data.location.id !== carry.location_id) {
                        carry.multiple = true;
                    }
                    carry.location_id = item.data.location.id;
                    return carry;
                },
                {
                    multiple: false,
                    location_id: 0,
                },
            );

        if (!multipleLocationsInvolved.multiple) {
            return null;
        }

        return (
            EventAtLocationNode.all(cy)
                .filter((e) => e.data.transport_unit.id === tu.id)
                .filter((e) => {
                    return e.data.location.id === multipleLocationsInvolved.location_id;
                })
                .sort((event1, event2) => {
                    return +moment(event1.data.event_date) - +moment(event2.data.event_date);
                })
                .shift() ?? null
        );
    }
    /**
     * This function will return the VD event, or the last event at the first location, if no VD was found
     * @param tu The TU to look for
     * @param cy The story
     */
    public static getVesselDepartureEvent(tu: TransportUnit, cy: cytoscape.Core): EventAtLocationNode | null {
        const firstVD =
            EventAtLocationNode.all(cy)
                .filter((e) => e.data.transport_unit.id === tu.id)
                .filter((e) => e.data.status_code && e.data.status_code.status_code == 'VD')
                .sort((event1, event2) => {
                    return +moment(event1.data.event_date) - +moment(event2.data.event_date);
                })
                .shift() ?? null;
        if (firstVD) {
            return firstVD;
        }

        // Check for first event at last location if no VD

        const multipleLocationsInvolved = EventAtLocationNode.all(cy)
            .filter((e) => e.data.transport_unit.id === tu.id)
            .sort((event1, event2) => {
                return +moment(event1.data.event_date) - +moment(event2.data.event_date);
            })
            .reduce(
                (carry, item) => {
                    if (!item.data.location) {
                        return carry;
                    }
                    if (carry.location_id !== 0 && item.data.location.id !== carry.location_id) {
                        carry.multiple = true;
                    }
                    if (carry.location_id === 0) {
                        carry.location_id = item.data.location.id;
                    }
                    return carry;
                },
                {
                    multiple: false,
                    location_id: 0,
                },
            );

        if (!multipleLocationsInvolved.multiple) {
            return null;
        }

        return (
            EventAtLocationNode.all(cy)
                .filter((e) => e.data.transport_unit.id === tu.id)
                .filter((e) => {
                    return e.data.location.id === multipleLocationsInvolved.location_id;
                })
                .sort((event1, event2) => {
                    return +moment(event1.data.event_date) - +moment(event2.data.event_date);
                })
                .pop() ?? null
        );
    }

    public static getSegments(cy: cytoscape.Core, execContext: ExecutionContext): UOTMChangedETASegment[] {
        // For each TU that is handled in the story, we'll make a TUDDCondition
        const transportUnits = EventAtLocationNode.all(cy).reduce((carry, item) => {
            if (carry.findIndex((e) => item.data.transport_unit && e.id === item.data.transport_unit.id) === -1) {
                carry.push(item.data.transport_unit);
            }
            return carry;
        }, [] as TransportUnit[]);
        return transportUnits
            .map((tu) => this.getChangedETAs(tu, cy, execContext))
            .filter((e) => e !== null) as UOTMChangedETASegment[];
    }

    public static getChangedETAs(
        tu: TransportUnit,
        cy: cytoscape.Core,
        _execContext: ExecutionContext,
    ): UOTMChangedETASegment | null {
        //get first Event of last location which is alternative of vessel arrival
        const vesselArrivalEvent: EventAtLocationNode | null = this.getVesselArrivalEvent(tu, cy);

        if (!vesselArrivalEvent) {
            return null;
        }

        const eventsLogs: ChangedETALogEntry[] = this.getETALogEntries(cy, vesselArrivalEvent);

        if (eventsLogs.length === 0) {
            return null;
        }
        const lastAlert = eventsLogs[eventsLogs.length - 1];
        return {
            type: 'ChangedETA',
            current_alert: moment(lastAlert.valid_until).isAfter(moment()) ? lastAlert : null,
            log: eventsLogs,
            carrier_transport_unit_id: +vesselArrivalEvent.data.carrier_transport_unit?.id ?? null,
            carrier_transport_unit: vesselArrivalEvent.data.carrier_transport_unit,
            location: vesselArrivalEvent.data.location ?? null,
            location_id: +vesselArrivalEvent.data.location?.id ?? null,
            transport_unit: tu,
            transport_unit_id: +tu.id,
        };
    }
}
