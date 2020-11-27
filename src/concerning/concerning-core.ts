import { sha1 } from 'object-hash';
import { TravelInfo, Vessel, VesselInfomation } from '../types/docky-shipment-status-types';

import { ExecutionContext } from '../types/execution-context';
import { TransportSegment } from '../types/transportSegment';
import { UOTMMessage } from '../types/uotm-message';
export class ConcerningCore {
    public async execute(cy: cytoscape.Core, execContext: ExecutionContext): Promise<UOTMMessage> {
        /**
         * Add the general header with identy-info
         */
        const segments: TransportSegment[] = [];

        // Dirty-fix the tradeflow-id
        if (!execContext.tradeflow_id) {
            execContext.tradeflow_id = execContext.locks.reduce((carry, item) => {
                return item.id.toString();
            }, '');
        }
        [1, 2, 3].map(async (key) => {
            const travelInfo: TravelInfo[] = [];
            let carrier: Vessel | null = null;
            let current_speed = '';
            let current_location = '';
            let next_lock = '';
            let expected_speed = '';
            let expected_waiting = '';
            cy.edges().filter((e) => {
                return e.data().vesselInfo.forEach((element: VesselInfomation) => {
                    if (element.Carrier && element.Carrier.id === key) {
                        element.TravelInfo.CorridorName = e.data().corridor_name;
                        travelInfo.push(element.TravelInfo as TravelInfo);
                        carrier = element.Carrier;
                        if (element.TravelInfo.Current_Speed) {
                            current_speed = element.TravelInfo.Current_Speed;
                            expected_speed = element.TravelInfo.Expected_Speed;
                            next_lock = element.TravelInfo.NextLock;
                            current_location = element.TravelInfo.CorridorName ? element.TravelInfo.CorridorName : '';
                            expected_waiting = element.TravelInfo.Expected_waiting_time;
                        }
                    }
                });
            });
            segments.push({
                carrier: carrier ? carrier : null,
                current_speed: current_speed,
                current_corridor_location: current_location,
                expected_speed: expected_speed,
                travel_path: travelInfo,
                next_lock: next_lock,
                next_waitingTime: expected_waiting,
            } as TransportSegment);
        });

        const uotm = {
            tradeflow_id: execContext.tradeflow_id,
            segments: segments.filter((e) => e.carrier !== null),
            hash: '--placeholder--',
        } as UOTMMessage;
        uotm.hash = sha1(uotm);
        return uotm;
    }
}
