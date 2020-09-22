export interface DockyShipmentStatus {
    id: number;
    message: string;
    specific_status_type: string;
    specific_status_id: number;
    event_date: Date;
    created_at: Date;
    updated_at: Date;
    tradeflow_id: number;
    shipment_condition_reading_source_id: number;
    transport_unit_id: number;
    location_id: number;
    actual: boolean;
    carrier_entity_id: number;
    carrier_transport_unit_id: null;
    cargo_id: null;
    document_id: null;
    status_code_id: number;
    user_id: null;
    mute: boolean;
    log_level_id: null;
    specific_status: SpecificStatus;
    status_code: StatusCode;
    carrier: Carrier;
    location: Location;
    transport_unit: TransportUnit;
    carrier_transport_unit: Carrier_transport_unit;
    shipment_condition_reading_source: ShipmentConditionReadingSource;
}

export interface Carrier {
    id: number;
    name: string;
    name_short: null;
    legal_form: null;
    registered_office_address_id: null;
    created_at: null;
    updated_at: null;
    entity_profile_information_id: null;
    vat_registry_id: null;
    vat_registration_reference: string;
    vetted: number;
    prefered_language_code: string;
    onboarding_completed: boolean;
    is_admin_entity: boolean;
}

export interface Location {
    id: number;
    name: string;
    type: string;
    reference: string;
    geolocation: Geolocation;
    raw_location_type: string;
    raw_location_id: number;
    address_line: null;
    postal_code: null;
    country_id: number;
    created_at: null;
    updated_at: Date;
    timezone: string;
    fullAddress: string;
    point: Point;
    country: Country;
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

export interface SpecificStatus {
    id: number;
    created_at: Date;
    updated_at: Date;
    data_reference: string;
    subscription_id: string;
    raw_attribute: string;
    raw_filetype: string;
    booking_reference: string | null;
    bill_of_lading_reference: string | null;
}

export interface StatusCode {
    id: number;
    message: string;
    status_code: string;
    created_at: null;
    updated_at: null;
}

export interface TransportUnit {
    id: number;
    reference: string;
    specific_tu_type_id: number;
    specific_tu_type_type: string;
    created_at: Date;
    updated_at: Date;
    type: string;
}

export interface Carrier_transport_unit {
    id: number;
    reference: string;
    specific_tu_type_id: number;
    specific_tu_type_type: string;
    created_at: Date;
    updated_at: Date;
    pseudo: boolean;
    type: string;
}
