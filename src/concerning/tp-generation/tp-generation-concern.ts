import { SeaShipment, TPShipment, SeaMovement, PredictedTimeLog } from '../../types/grouped-transport-plan-types';
import { LocationBorderNode } from '../../story-building/nodes/location-border-node';
import { UOTMTransportPlanSegment } from '../../types/uotm-transportplan-segment';
import { TransportUnit } from '../../types/docky-shipment-status-types';

export class TPGeneration {
    public static getSegments(cy: cytoscape.Core): UOTMTransportPlanSegment[] {
        // Since we assume one transport plan per trade_flow
        return [TPGeneration.getTransportPlanSegment(cy)] as UOTMTransportPlanSegment[];
    }

    public static getTransportPlanSegment(cy: cytoscape.Core): UOTMTransportPlanSegment {
        const tp_shipment: TPShipment[] = [];
        let endingNodes: LocationBorderNode[] = [];

        endingNodes = LocationBorderNode.all(cy).filter((e) => e.streamNodes('downstream').length === 0);

        if (TPGeneration.hasExtendedTransportPlans(cy, endingNodes)) {
            /*
            here we have all the start and end nodes but some containers will be missing in between those tp.
            So we go each end_node and check that any other container left before this end_node. if we have that means that containers
            should have seperate tp.so we add that as another end_node.
            */
            [...endingNodes].forEach((endingNode) => {
                let node_containers = endingNode.data.containers.length;
                [...endingNode.streamNodes('upstream').reverse()].forEach((node) => {
                    // check from end to start
                    if (node.data.moveType == 'IN' && node_containers < node.data.containers.length) {
                        // which means here we have a end node of a tp
                        endingNodes.push(node);
                        node_containers = node.data.containers.length;
                    }

                    if (!TPGeneration.hasExtendedTransportPlans(cy, endingNodes)) return;
                });
            });
        }

        endingNodes.forEach((endingNode) => {
            const seaShipment: SeaShipment[] = [];
            const seaMovement: SeaMovement[] = [];

            const transportNodes = [...endingNode.streamNodes('upstream').reverse(), endingNode];

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
                        carrier: in_node.data.carrier,
                        carrier_transport_unit: in_node.data.carrier_transport_unit,
                        completed: true, //  temporary value
                    } as SeaMovement);
                });

            // will recieve sea shipment of perticular container set
            seaShipment.push({
                carrier: endingNode.data.carrier,
                type: 'SeaShipment',
                booking_number: endingNode.data.booking_reference ? endingNode.data.booking_reference : null,
                bill_of_lading_number: endingNode.data.booking_reference ? endingNode.data.booking_reference : null,
                sea_shipment_legs: seaMovement,
            } as SeaShipment); // missing TransportPlanLeg

            tp_shipment.push({
                containers: TPGeneration.getContainers(endingNode),
                transport_plan_legs: seaShipment,
            });
        });

        return {
            type: 'TransportPlan',
            shipments: tp_shipment,
        };
    }

    /*
    if we have all the tp of each container then starting node containers and ending node containers
    should be equal. else starting node_containers greater than ending node_containers.
    */
    public static hasExtendedTransportPlans(cy: cytoscape.Core, endingNodes: LocationBorderNode[]): boolean {
        const ending_containers = endingNodes
            .filter((e) => e.streamNodes('downstream').length === 0)
            .reduce((ending_containers, end_node) => {
                ending_containers += end_node.data.containers.length;
                return ending_containers;
            }, 0);

        const starting_containers = LocationBorderNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .reduce((starting_containers, end_node) => {
                starting_containers += end_node.data.containers.length;
                return starting_containers;
            }, 0);

        return starting_containers > ending_containers;
    }

    /*
    Here we check ending Node has next Node containers if there's any then we filter it.
    */
    public static getContainers(endingNode: LocationBorderNode): TransportUnit[] {
        if (endingNode.streamNodes('downstream').length === 0) return endingNode.data.containers;

        const donwstream_containers = endingNode.streamNodes('downstream')?.[0].data.containers;
        return endingNode.data.containers.filter((x: TransportUnit) => {
            if (donwstream_containers.filter((e: TransportUnit) => e.reference === x.reference).length == 0) return x;
        });
    }

    static findEventDate(event_date_log: PredictedTimeLog[]): string | null {
        const actualTrue = event_date_log.filter((e) => e.actual === true).shift();
        if (actualTrue) return actualTrue.event_date;
        const actualFalse = event_date_log.filter((e) => e.actual === false).shift();
        if (actualFalse) return actualFalse.event_date;
        return null;
    }
}
