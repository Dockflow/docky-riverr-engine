import { EventAtLocationNode, EventDateLogEntry } from '../story-building/nodes/event-at-location-node';
import { TransportUnit } from '../types/docky-shipment-status-types';
import { GroupedMilestones, MilestoneEvent, Milestone } from '../types/grouped-milestone-types';
import { UOTMContainerMilestonesSegment } from '../types/uotm-container-milestones-segment';
import { ExecutionContext } from '../types/execution-context';

export class ContainerMilestonesConcern {
    public static getSegments(cy: cytoscape.Core, execContext: ExecutionContext): UOTMContainerMilestonesSegment[] {
        // For each TU that is handled in the story, we'll make a ContainerMileStoneSegment
        const transportUnits = EventAtLocationNode.all(cy).reduce((carry, item) => {
            if (carry.findIndex((e) => item.data.transport_unit && e.id === item.data.transport_unit.id) === -1) {
                carry.push(item.data.transport_unit);
            }
            return carry;
        }, [] as TransportUnit[]);

        return transportUnits
            .map((e) => ContainerMilestonesConcern.getTUDDCondition(e, cy, execContext))
            .filter((e) => e !== null) as UOTMContainerMilestonesSegment[];
    }

    public static getTUDDCondition(
        tu: TransportUnit,
        cy: cytoscape.Core,
        execContext: ExecutionContext,
    ): UOTMContainerMilestonesSegment | null {
        const log: GroupedMilestones = {
            milestones: [],
        };

        const startingNode = EventAtLocationNode.all(cy)
            .filter((e) => e.data.transport_unit.id === tu.id)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .sort((a, b) => {
                const aCount = a.streamNodes('downstream').length;
                const bCount = b.streamNodes('downstream').length;

                return bCount - aCount;
            })
            .shift();

        if (!startingNode) {
            return null;
        }

        log.milestones = [startingNode, ...startingNode.streamNodes('downstream')].map((node) => {
            return {
                actual: node.data.actual,
                event_date: node.data.event_date,
                location: node.data.location,
                message: node.data.message,
                events: (node.data.event_date_log as Array<EventDateLogEntry>)
                    .map((e) => {
                        return {
                            event_date: e.event_date,
                            actual: e.actual,
                            location: e.source_shipment_status?.location ?? node.data.location,
                            source: e.source_shipment_status?.shipment_condition_reading_source.name ?? '-',
                        } as MilestoneEvent;
                    })
                    .reduce((carry, item) => {
                        if (carry.filter((e) => e.event_date === item.event_date).length === 0) {
                            carry.push(item);
                        }
                        return carry;
                    }, [] as MilestoneEvent[]),
            } as Milestone;
        });

        return {
            tradeflow_id: execContext.tradeflow_id,
            type: 'ContainerMilestones',
            transport_unit: tu,
            log: log,
        };
    }
}
