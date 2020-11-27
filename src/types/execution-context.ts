import { Locks } from './docky-shipment-status-types';
import { ExecutionConfiguration } from './execution-configuration';

export type RequestContext = {
    locks: Locks[];
    config?: ExecutionConfiguration;
    tradeflow_id: string;
};

export type ExecutionContext = {
    locks: Locks[];
    config: ExecutionConfiguration;
    tradeflow_id: string;
};
