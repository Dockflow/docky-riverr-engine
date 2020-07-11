import { UOTMSegment } from './uotm-segment';

export type UOTMMessage = {
    hash: string;
    segments: UOTMSegment[];
    tradeflow_id: string;
};
