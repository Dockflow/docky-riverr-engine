import { TPShipment } from './grouped-transport-plan-types';

export type UOTMTransportPlanSegment = {
    type: 'TransportPlan';
    shipments: Array<TPShipment>;
};
