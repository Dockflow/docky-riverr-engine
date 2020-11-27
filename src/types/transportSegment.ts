import { TravelInfo, Vessel, VesselInfomation } from "./docky-shipment-status-types";

export type TransportSegment = {
    vessel: Vessel | null;
    current_speed: string;
    expected_speed: string;
    travel_path: TravelInfo[] | null;
    next_waitingTime: string;
};
