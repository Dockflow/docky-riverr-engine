import { TransportUnit, Location } from './docky-shipment-status-types';
import { DataObject } from './data-object';
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
    delta_in_seconds: number;
    delay?: any;
    eta_event_based?: DataObject;
    eta_changes_number?: number;
    stats?: any;
};
