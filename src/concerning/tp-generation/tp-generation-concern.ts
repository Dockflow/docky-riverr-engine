import { SeaShipment, TPShipment, SeaMovement, PredictedTimeLog } from '../../types/grouped-transport-plan-types';
import { LocationBorderNode } from '../../story-building/nodes/location-border-node';
import { UOTMTransportPlanSegment } from '../../types/uotm-transportplan-segment';

export class TPGeneration {
    public static getSegments(cy: cytoscape.Core): UOTMTransportPlanSegment[] {
        // Since we assume one transport plan per trade_flow
        return [TPGeneration.getTransportPlanSegment(cy)] as UOTMTransportPlanSegment[];
    }

    public static getTransportPlanSegment(cy: cytoscape.Core): UOTMTransportPlanSegment {
        const tp_shipment: TPShipment[] = [];
        LocationBorderNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .forEach((startingNode) => {
                const seaShipment: SeaShipment[] = [];
                const seaMovement: SeaMovement[] = [];

                const transportNodes = [startingNode, ...startingNode.streamNodes('downstream')];

                // will get set of sea movements
                transportNodes
                    .filter((e) => e.data.moveType === 'OUT')
                    .forEach((out_node) => {
                        const in_node = transportNodes[transportNodes.indexOf(out_node) + 1];
                        seaMovement.push({
                            port_of_loading: out_node.data.location,
                            port_of_discharge: in_node.data.location,
                            departure_date: this.findEventDate(out_node.data.event_date_log),
                            departure_date_history: out_node.data.event_date_log,
                            arrival_date: this.findEventDate(in_node.data.event_date_log),
                            arrival_date_history: in_node.data.event_date_log,
                            carrier: in_node.data.carrier_transport_unit?.name,
                            carrier_transport_unit: in_node.data.carrier_transport_unit,
                            completed: true, //  temporary value
                        } as SeaMovement);
                    });

                // will recieve sea shipment of perticular container set
                seaShipment.push({
                    carrier: startingNode.data.carrier_transport_unit?.name,
                    type: 'SeaShipment',
                    booking_number: startingNode.data.booking_reference ? startingNode.data.booking_reference : null,
                    bill_of_lading_number: startingNode.data.booking_reference
                        ? startingNode.data.booking_reference
                        : null,
                    sea_shipment_legs: seaMovement,
                } as SeaShipment); // missing TransportPlanLeg

                tp_shipment.push({
                    containers: startingNode.data.containers,
                    transport_plan_legs: seaShipment,
                });
            });

        return {
            type: 'TransportPlan',
            shipments: tp_shipment,
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
