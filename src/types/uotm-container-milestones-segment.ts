import { TransportUnit } from './docky-shipment-status-types';
import { GroupedMilestones } from './grouped-milestone-types';

export type UOTMContainerMilestonesSegment = {
    type: 'ContainerMilestones';
    transport_unit: TransportUnit;
    tradeflow_id: string;
    log: GroupedMilestones;
};
