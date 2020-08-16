import cytoscape from 'cytoscape';
import moment from 'moment';

import { EventAtLocationNode } from '../story-building/nodes/event-at-location-node';
import { SSEventNode } from '../story-building/nodes/ss-event-node';
import { TransportUnit } from '../types/docky-shipment-status-types';
import { ExecutionContext } from '../types/execution-context';
import { ChangedETALogEntry, UOTMChangedETASegment } from '../types/uotm-changed-eta-segment';

//Get the last event with eventCode

export class ChangedETAConcern {
    public static generateLogsfromLastLocationEvents(
        cy: cytoscape.Core,
        event: EventAtLocationNode,
    ): ChangedETALogEntry[] {
        let lastPredicted: string | null = null;
        let logs: ChangedETALogEntry[] = [];

        logs = (event as EventAtLocationNode)
            .getIncomingSSEventNodeIds()
            .map((e) => {
                return new SSEventNode({ data: cy.$id(e).data() }, cy);
            })
            .sort((a, b) => {
                if (a.data.shipment_status.created_at === b.data.shipment_status.created_at) {
                    return 0;
                }
                return moment(a.data.shipment_status.created_at) > moment(b.data.shipment_status.created_at) ? 1 : -1;
            })
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
        return logs;
    }

    public static firstEventLastLocation(tu: TransportUnit, cy: cytoscape.Core): EventAtLocationNode | null {
        const lastEvents = EventAtLocationNode.all(cy).filter((e) => e.data.transport_unit.id === tu.id);

        const getDestinationEventLocationId = lastEvents.sort((event1, event2) => {
            return moment(event1.data.event_date) < moment(event2.data.event_date) ? 1 : -1;
        })[0].data.location.id;

        const getOriginEventLocationId = lastEvents.sort((event1, event2) => {
            return moment(event1.data.event_date) < moment(event2.data.event_date) ? 1 : -1;
        })[lastEvents.length - 1].data.location.id;

        if (getOriginEventLocationId === getDestinationEventLocationId) {
            return null;
        }
        const firstEventOfLastLocation = lastEvents
            .filter((e) => {
                return e.data.location.id === getDestinationEventLocationId;
            })
            .sort((event1, event2) => {
                return moment(event1.data.event_date) > moment(event2.data.event_date) ? 1 : -1;
            });
        return firstEventOfLastLocation[0];
    }

    public static getLastEvents(eventCode: string, tu: TransportUnit, cy: cytoscape.Core): EventAtLocationNode | null {
        const lastEvents = EventAtLocationNode.all(cy)
            .filter((e) => e.data.transport_unit.id === tu.id)
            .filter((e) => e.data.status_code.status_code === eventCode)
            .filter((e) => {
                // Check it's VA event on the milestone
                return (
                    e.streamNodes('downstream').filter((dsn) => dsn.data.status_code.status_code === eventCode)
                        .length === 0
                );
            })
            .filter((e) => {
                // It must be actual false or have actuals down the line
                return (
                    e.data.actual === false &&
                    e.streamNodes('downstream').filter((dsn) => dsn.data.actual === true).length === 0
                );
            })
            .pop();
        return lastEvents ?? null;
    }

    public static generatLogsfromEvents(
        cy: cytoscape.Core,
        events: { va: EventAtLocationNode | undefined; uv: EventAtLocationNode | undefined },
    ): ChangedETALogEntry[] {
        let lastPredicted: string | null = null;
        let logs: ChangedETALogEntry[] = [];
        if (!events) return logs;
        else if (!events.va && !events.uv) return logs;
        else {
            const eventList = events.va ? events.va : events.uv;
            logs = (eventList as EventAtLocationNode)
                .getIncomingSSEventNodeIds()
                .map((e) => {
                    return new SSEventNode({ data: cy.$id(e).data() }, cy);
                })
                .sort((a, b) => {
                    if (a.data.shipment_status.created_at === b.data.shipment_status.created_at) {
                        return 0;
                    }
                    return moment(a.data.shipment_status.created_at) > moment(b.data.shipment_status.created_at)
                        ? 1
                        : -1;
                })
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
            return logs;
        }
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
        execContext: ExecutionContext,
    ): UOTMChangedETASegment | null {
        //get first Event of last location which is alternative of vessel arrival
        const lastLocationEvent: EventAtLocationNode | null = this.firstEventLastLocation(tu, cy);

        if (!lastLocationEvent) return null;

        const eventsLogs: ChangedETALogEntry[] = this.generateLogsfromLastLocationEvents(cy, lastLocationEvent);

        if (eventsLogs && eventsLogs.length === 0) {
            return null;
        }

        const lowestDate: moment.Moment = (eventsLogs as ChangedETALogEntry[])
            .reduce((carry, item) => {
                if(item.new){
                    carry.push(moment(item.new));
                }
                if(item.previous){
                    carry.push(moment(item.previous));
                }
                return carry;
            }, [] as moment.Moment[])
            .reduce((carry, item) => {
                if (carry == null) {
                    return item;
                }
                return carry > item ? carry : item;
            });
        const highestDate: moment.Moment = (eventsLogs as ChangedETALogEntry[])
            .reduce((carry, item) => {
                if(item.new){
                    carry.push(moment(item.new));
                }
                if(item.previous){
                    carry.push(moment(item.previous));
                }
                return carry;
            }, [] as moment.Moment[])
            .reduce((carry, item) => {
                if (carry == null) {
                    return item;
                }
                return carry < item ? carry : item;
            });

        //delay limit set by user

        const delay = execContext.config.eta_delay_in_hours ?? 12;

        //eta event number limit set by user
        // const etaChangesLimit = config.configuration.eta_changed_limit ?? 3;

        const timeDelay = Math.abs(highestDate.diff(lowestDate, 'hours'));

        //const etaChangesNumber = lastLocationEvent.getIncomingSSEventNodeIds().length;

        const alert = timeDelay > delay;
        //if no delay or too much eta events
        if (!alert) {
            return null;
        }
        // if eta changes multiple times or eta time delay is wide send alarm depending on severity nature
        return {
            type: 'ChangedETA',
            alert: alert,
            log: eventsLogs,
            location: lastLocationEvent.data.location || null,
            transport_unit: tu,
            delta_in_seconds: highestDate.diff(lowestDate, 'seconds'),
            eta_event_based: lastLocationEvent.data,
            eta_changes_number: lastLocationEvent.getIncomingSSEventNodeIds().length,
        };
    }
}
