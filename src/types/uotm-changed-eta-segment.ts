import { TransportUnit } from './docky-shipment-status-types';
export type ChangedETALogEntry = {
    previous: string;
    new: string;
};
export type UOTMChangedETASegment = {
    type: 'ChangedETA';
    alert: boolean;
    transport_unit: TransportUnit;
    log: ChangedETALogEntry[];
};
