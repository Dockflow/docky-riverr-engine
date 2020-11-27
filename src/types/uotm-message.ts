import { TransportSegment } from './transportSegment';

export type UOTMMessage = {
    hash: string;
    segments: TransportSegment[];
    tradeflow_id: string | number | null;
};
