import { SeaShipment, TPShipment, SeaMovement, PredictedTimeLog } from '../../types/grouped-transportPlan-types';
import { LocationBorderNode } from '../../story-building/nodes/location-border-node';
import { UOTMTransportPlanSegment } from '../../types/uotm-transportplan-segment';
import { TransportUnit } from '../../types/docky-shipment-status-types';

export class TPGeneration {
    public static getSegments(cy: cytoscape.Core): UOTMTransportPlanSegment[] {
        // Since we assume one transport plan per trade_flow
        return [TPGeneration.getTransportPlanSegment(cy)] as UOTMTransportPlanSegment[];
    }

    public static getTransportPlanSegment(cy: cytoscape.Core): UOTMTransportPlanSegment | null {
        const transportUnit: TransportUnit[] = []; //
        const seaShipment: SeaShipment[] = [];
        LocationBorderNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .forEach((startingNode) => {
                const seaMovement: SeaMovement[] = [];
                const transportNodes = [startingNode, ...startingNode.streamNodes('downstream')];
                transportNodes
                    .filter((e) => e.data.moveType === 'OUT')
                    .forEach((node, index) => {
                        seaMovement.push({
                            port_of_loading: transportNodes[index + 1].data.location,
                            port_of_discharge: node.data.location,
                            departure_date: this.findEventDate(node.data.event_date_log),
                            arrival_date: this.findEventDate(transportNodes[index + 1].data.event_date_log),
                            arrival_date_history: transportNodes[index + 1].data.event_date_log,
                            departure_date_history: node.data.event_date_log,
                            carrier: node.data.carrier_transport_unit?.name,
                            carrier_transport_unit: node.data.carrier_transport_unit,
                            completed: true, //  temporary value
                        } as SeaMovement);
                    });
                seaShipment.push({
                    carrier: startingNode.data.carrier_transport_unit?.name,
                    type: 'SeaShipment',
                    booking_number: startingNode.data.booking_reference ? startingNode.data.booking_reference : null,
                    bill_of_lading_number: startingNode.data.booking_reference
                        ? startingNode.data.booking_reference
                        : null,
                    sea_shipment_legs: seaMovement,
                } as SeaShipment); // missing TransportPlanLeg
            });

        return {
            type: 'TransportPlan',
            shipments: [
                {
                    containers: transportUnit,
                    transport_plan_legs: seaShipment,
                } as TPShipment,
            ],
        };
    }
    static findEventDate(event_date_log: PredictedTimeLog[]): string | null {
        const actualTrue = event_date_log.filter((e) => e.actual === true).shift();
        if (actualTrue) return actualTrue.event_date;
        const actualFalse = event_date_log.filter((e) => e.actual === false).shift();
        if (actualFalse) return actualFalse.event_date;
        return null;
    }
}
