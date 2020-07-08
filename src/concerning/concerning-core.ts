import { UOTMMessage } from '../types/uotm-message';
import { DockyShipmentStatus } from '../types/docky-shipment-status-types';
import { sha1 } from 'object-hash';

export class ConcerningCore {
    public async execute(story: any, shipmentStatuses: DockyShipmentStatus[]): Promise<UOTMMessage> {
        /**
         * Add the general header with identy-info
         */
        const id = shipmentStatuses[0].tradeflow_id.toString();

        const uotm = {
            tradeflow_id: id,
            segments: [],
            hash: '--placeholder--',
        } as UOTMMessage;
        uotm.hash = sha1(uotm);
        return uotm;
    }
}
