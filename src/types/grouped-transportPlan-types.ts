import { Location, TransportUnit } from './docky-shipment-status-types';
import { Entity } from './entity';

export type PredictedTimeLog = {
    reading: string | null; // When is the TU arriving / departing      // temp null
    event_date: string | null; // When this prediction was made
    actual: boolean;
};

export type TransportPlanLeg = {
    sequence_number: number;
    type: string;
    completed: boolean;
};

export type SeaShipment = TransportPlanLeg & {
    carrier: Entity | null;
    type: 'SeaShipment';
    booking_number: string | null;
    bill_of_lading_number: string | null;
    sea_shipment_legs: Array<SeaMovement>;
};

export type SeaMovement = {
    port_of_loading: Location;
    port_of_discharge: Location;
    departure_date: string | null;
    arrival_date: string | null;
    arrival_date_history: Array<PredictedTimeLog> | null;
    departure_date_history: Array<PredictedTimeLog> | null; // temp null
    carrier: Entity | null;
    carrier_transport_unit: TransportUnit | null;
    completed: boolean;
};

export type TPShipment = {
    containers: Array<TransportUnit>;
    transport_plan_legs: Array<SeaShipment>;
};
