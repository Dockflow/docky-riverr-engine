import { SeaShipment, TPShipment, SeaMovement, PredictedTimeLog } from '../../types/grouped-transport-plan-types';
import { UOTMTransportPlanSegment } from '../../types/uotm-transportplan-segment';
import { StoryBuildingCore } from '../../story-building/story-building-core';

export class TPGeneration {
    public static getSegments(cy: cytoscape.Core): UOTMTransportPlanSegment[] {
        // Since we assume one transport plan per trade_flow
        return [TPGeneration.getTransportPlanSegment(cy)] as UOTMTransportPlanSegment[];
    }

    public static getTransportPlanSegment(cy: cytoscape.Core): UOTMTransportPlanSegment {
        const tp_shipment: TPShipment[] = [];
        const storyBuildingCore = new StoryBuildingCore();

        storyBuildingCore.getAllBorderNodes(cy).forEach((endingNode) => {
            const seaShipment: SeaShipment[] = [];
            const seaMovement: SeaMovement[] = [];

            const transportNodes = [...endingNode.streamNodes('upstream').reverse(), endingNode];
            const carrierIdMap = new Set();

            // will get set of sea movements
            transportNodes
                .filter((e) => e.data.moveType === 'OUT')
                .forEach((out_node) => {
                    const in_node = transportNodes[transportNodes.indexOf(out_node) + 1];
                    if (in_node.data.carrier) {
                        carrierIdMap.add(in_node.data.carrier.id);
                    }
                    seaMovement.push({
                        port_of_loading: out_node.data.location,
                        port_of_discharge: in_node.data.location,
                        departure_date: this.findEventDate(out_node.data.event_date_log),
                        departure_date_history: out_node.data.event_date_log,
                        arrival_date: this.findEventDate(in_node.data.event_date_log),
                        arrival_date_history: in_node.data.event_date_log,
                        carrier: in_node.data.carrier,
                        carrier_transport_unit: in_node.data.carrier_transport_unit,
                        completed: true, //  temporary value
                    } as SeaMovement);
                });

            // will catogories each sea movement under carrier id and added to tp legs.
            carrierIdMap.forEach((carrierId) => {
                const seaMovements = seaMovement.filter((e) => e.carrier?.id === carrierId);
                seaShipment.push({
                    carrier: seaMovements[0].carrier,
                    type: 'SeaShipment',
                    booking_number: endingNode.data.booking_reference ? endingNode.data.booking_reference : null,
                    bill_of_lading_number: endingNode.data.booking_reference ? endingNode.data.booking_reference : null,
                    sea_shipment_legs: seaMovements,
                } as SeaShipment); // missing TransportPlanLeg
            });

            tp_shipment.push({
                containers: storyBuildingCore.getContainers(endingNode),
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
