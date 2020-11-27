export type Vessel = {
    id: number;
    port_of_loading: string;
    port_of_discharge: string;
    departure_date: string | null;
    arrival_date: string | null;
    name: string;
};

export type VesselInfomation = {
    Carrier: Vessel;
    TravelInfo: TravelInfo;
};

export type TravelInfo = {
    Current_Speed: string | null;
    Expected_Speed: string;
    Expected_waiting_time: string;
    CorridorName: string | null;
    NextLock: string;
};

export type Locks = {
    id: number;
    location: Location;
    waiting_time: number;
    lock: string;
};
export interface Location {
    id: number;
    name: string;
    type: string;
    reference: string;
    geolocation: Geolocation;
    country: string;
}

export interface Country {
    id: number;
    name: string;
    name_long: string;
    postal: string;
    name_formal: string;
    iso_a2: string;
    iso_a3: string;
    coordinate: Point;
    uic_country_code: string;
    uic_id: string;
    uic_description: string;
}

export interface Point {
    type: string;
    coordinates: number[];
}

export interface Geolocation {
    type: string;
    geometries: Point[];
}

export interface ShipmentConditionReadingSource {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
    device_id: number;
    device_type: string;
    reference: string;
    device: null;
}
export interface TransportUnit {
    id: number;
    reference: string;
    specific_tu_type_id: number;
    specific_tu_type_type: string;
    created_at: Date;
    updated_at: Date;
    type: string;
    pseudo: boolean;
}
