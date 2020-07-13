import { TransportUnit, Location } from './docky-shipment-status-types';
export type ChangedETALogEntry = {
    previous: string;
    new: string;
};
export type UOTMChangedETASegment = {
    type: 'ChangedETA';
    alert: boolean;
    transport_unit: TransportUnit;
    location: Location;
    log: ChangedETALogEntry[];
};
