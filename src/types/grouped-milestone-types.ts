import { Location } from './docky-shipment-status-types';

export type MilestoneEvent = {
    event_date: string;
    location: Location;
    actual: boolean;
    source: string;
};
export type Milestone = {
    location: Location | null;
    event_date: string | null;
    message: string;
    actual: boolean;
    events: MilestoneEvent[];
};
export type GroupedMilestones = {
    milestones: Milestone[];
};
