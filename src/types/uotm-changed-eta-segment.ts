import { Location, TransportUnit } from './docky-shipment-status-types';

export type ChangedETALogEntry = {
    previous_reading: string;
    event_date: string;
    reading: string;
    hash: string;
    in_transit_change: boolean;
    valid_until: string;
};
export type UOTMChangedETASegment = {
    type: 'ChangedETA';
    current_alert: ChangedETALogEntry | null;
    transport_unit: TransportUnit;
    transport_unit_id: number | null;
    carrier_transport_unit: TransportUnit;
    carrier_transport_unit_id: number | null;
    location: Location;
    location_id: number | null;
    log: ChangedETALogEntry[];
};
