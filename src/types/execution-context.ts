import { DockyShipmentStatus } from './docky-shipment-status-types';
import { ExecutionConfiguration } from './execution-configuration';

export type RequestContext = {
    shipment_statuses: DockyShipmentStatus[];
    config?: ExecutionConfiguration;
    tradeflow_id: string;
};

export type ExecutionContext = {
    shipment_statuses: DockyShipmentStatus[];
    config: ExecutionConfiguration;
    tradeflow_id: string;
};
