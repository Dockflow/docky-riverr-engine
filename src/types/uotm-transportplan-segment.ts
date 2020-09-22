import { TPShipment } from './grouped-transportPlan-types';

export type UOTMTransportPlanSegment = {
    type: 'TransportPlan';
    shipments: Array<TPShipment>;
};
