import cytoscape, { EdgeDefinition } from 'cytoscape';

import { ExecutionContext } from '../types/execution-context';
import { SSEventNode } from './nodes/ss-event-node';
import { TravelInfo, Vessel, VesselInfomation } from '../types/docky-shipment-status-types';

export class StoryBuildingCore {
    DECLARING_SS_EDGE_TYPE = '_CORRIDOR';
    public async execute(execContext: ExecutionContext): Promise<cytoscape.Core> {
        const cy = cytoscape();
        /**
         * First we will add all locations
         */

        // Then we add all events that have locations to the correct locations
        const sseventNodes: SSEventNode[] = [];
        execContext.locks
            .filter((e) => e.location !== null)
            .forEach((ss) => {
                //    if(index === 0) LocationNode.firstOrCreate(ss.location, cy);
                sseventNodes.push(SSEventNode.create(ss, { parent: 12 }, cy));
            });

        const vesselInput: Vessel[] = [
            {
                id: 1,
                port_of_loading: execContext.locks[0].location.name,
                port_of_discharge: execContext.locks[3].location.name,
                departure_date: '2020-07-08T05:57:44.000000Z',
                arrival_date: '2020-07-08T05:57:44.000000Z',
                carrier: 'New Diamond',
            },
            {
                id: 2,
                port_of_loading: execContext.locks[0].location.name,
                port_of_discharge: execContext.locks[5].location.name,
                departure_date: '2020-07-08T05:57:44.000000Z',
                arrival_date: '2020-07-08T05:57:44.000000Z',
                carrier: 'Diana',
            },
            {
                id: 3,
                port_of_loading: execContext.locks[1].location.name,
                port_of_discharge: execContext.locks[7].location.name,
                departure_date: '2020-07-08T05:57:44.000000Z',
                arrival_date: '2020-07-08T05:57:44.000000Z',
                carrier: 'Charles III',
            },
        ];

        // Make event-nodes per TU and per location and attach the basic SSs
        if (sseventNodes.length > 7) {
            const vesselInfo_edge_0_2: VesselInfomation[] = [
                {
                    Carrier: vesselInput[1],
                    TravelInfo: {
                        Current_Speed: '5mph',
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '20 min',
                    } as TravelInfo,
                },
            ];
            const vesselInfo_edge_0_1: VesselInfomation[] = [
                {
                    Carrier: vesselInput[3],
                    TravelInfo: {
                        Current_Speed: null,
                        Expected_Speed: '2mph',
                        Expected_waiting_time: '10 min',
                    } as TravelInfo,
                },
            ];
            const vesselInfo_edge_2_3: VesselInfomation[] = [
                {
                    Carrier: vesselInput[1],
                    TravelInfo: {
                        Current_Speed: null,
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '20 min',
                    } as TravelInfo,
                },
            ];
            const vesselInfo_edge_1_3: VesselInfomation[] = [
                {
                    Carrier: vesselInput[2],
                    TravelInfo: {
                        Current_Speed: '7mph',
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '13 min',
                    } as TravelInfo,
                },
                {
                    Carrier: vesselInput[2],
                    TravelInfo: {
                        Current_Speed: null,
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '9 min',
                    } as TravelInfo,
                },
            ];
            const vesselInfo_edge_3_4: VesselInfomation[] = [
                {
                    Carrier: vesselInput[2],
                    TravelInfo: {
                        Current_Speed: '4.5 mph',
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '30 min',
                    } as TravelInfo,
                },
            ];
            const vesselInfo_edge_4_5: VesselInfomation[] = [
                {
                    Carrier: vesselInput[2],
                    TravelInfo: {
                        Current_Speed: null,
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '19 min',
                    } as TravelInfo,
                },
            ];
            const vesselInfo_edge_3_6: VesselInfomation[] = [
                {
                    Carrier: vesselInput[0],
                    TravelInfo: {
                        Current_Speed: '2mph',
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '19 min',
                    } as TravelInfo,
                },
            ];
            const vesselInfo_edge_6_7: VesselInfomation[] = [
                {
                    Carrier: vesselInput[0],
                    TravelInfo: {
                        Current_Speed: null,
                        Expected_Speed: '4mph',
                        Expected_waiting_time: '5 min',
                    } as TravelInfo,
                },
            ];

            cy.add({
                data: {
                    source: sseventNodes[0].id,
                    target: sseventNodes[1].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_0_1,
                    corridor_name: 'Scheldt',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);

            cy.add({
                data: {
                    source: sseventNodes[0].id,
                    target: sseventNodes[2].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_0_2,
                    corridor_name: 'Scheldt',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);

            cy.add({
                data: {
                    source: sseventNodes[2].id,
                    target: sseventNodes[3].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_2_3,
                    corridor_name: 'Scheldt',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);

            cy.add({
                data: {
                    source: sseventNodes[1].id,
                    target: sseventNodes[3].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_1_3,
                    corridor_name: 'Scheldt',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);

            cy.add({
                data: {
                    source: sseventNodes[3].id,
                    target: sseventNodes[4].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_3_4,
                    corridor_name: 'Scheldt',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);

            cy.add({
                data: {
                    source: sseventNodes[4].id,
                    target: sseventNodes[5].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_4_5,
                    corridor_name: 'Scheldt',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);

            cy.add({
                data: {
                    source: sseventNodes[3].id,
                    target: sseventNodes[6].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_3_6,
                    corridor_name: 'Leie',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);

            cy.add({
                data: {
                    source: sseventNodes[6].id,
                    target: sseventNodes[7].id,
                    type: this.DECLARING_SS_EDGE_TYPE,
                    vesselInfo: vesselInfo_edge_6_7,
                    corridor_name: 'Leie',
                    graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
                },
            } as EdgeDefinition);
        }

        return cy;
    }
    /*
    Here we collect all ending nodes of all sea shipments.
    */
}
