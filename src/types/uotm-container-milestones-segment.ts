import { TransportUnit, Location, DockyShipmentStatus } from './docky-shipment-status-types';

export type UOTMChangedETASegment = {
    type: 'ContainerMilestones';
    transport_unit: TransportUnit;
    log: any[];
};
