import cytoscape from 'cytoscape';

import { Carrier, EventDateLog, Location, TransportUnit } from '../../types/docky-shipment-status-types';
import { EventAtLocationNode } from './event-at-location-node';
import { LocationNode } from './location-node';
import { NodeModel, NodeModelDefinition } from './node-model';

export type MoveType = 'IN' | 'OUT';
export type LocationBorderNodeCharacteristics = {
    location: Location;
    moveType: MoveType;
    carrier: Carrier;
    carrier_transport_unit: TransportUnit;
    booking_reference: null | string;
    event_date_log: EventDateLog[];
    containers: TransportUnit[];
};

export class LocationBorderNode extends NodeModel {
    public static TYPE = 'LocationBorderNode';
    public static NEXT_LOCATION_EALN_EDGE = 'NEXT_LOCATION_EALN_EDGE';
    public static INT_LOCATION_EALN_EDGE = 'INT_LOCATION_EALN_EDGE'; // interlocation edge that connect inter location nodes

    public static create(keyData: LocationBorderNodeCharacteristics, cy: cytoscape.Core): LocationBorderNode {
        const node = new this(
            {
                data: {
                    type: this.TYPE,
                    name:
                        keyData.moveType +
                        (keyData.carrier_transport_unit ? keyData.carrier_transport_unit.reference : ''),
                    ...keyData,
                    parent: LocationNode.firstOrCreate(keyData.location, cy).id,
                },
                classes: this.TYPE,
            },
            cy,
        );
        return node;
    }

    public static firstOrCreate(
        mt: MoveType,
        ealn: EventAtLocationNode,
        cy: cytoscape.Core,
        booking: string,
    ): LocationBorderNode {
        const node = cy
            .nodes()
            .filter((e) => e.data('type') === this.TYPE)
            // .filter((e) => e.data().shipment_condition_reading_source_id !== ealn.data.location.shipment_condition_reading_source_id)`
            .filter((e) => e.data().location.id === ealn.data.location.id)
            .filter((e) => e.data().location.updated_at === ealn.data.location.updated_at)
            .filter((e) => e.data().moveType === mt);
        if (node.length > 0) {
            // add event_date_log
            node.first().data().event_date_log.push({
                reading: null, // When is the TU arriving / departing
                event_date: ealn.data.event_date, // When this prediction was made
                actual: ealn.data.actual,
            });

            // add transport units
            node.first().data().containers.push(ealn.data.transport_unit);
        }

        const theNode =
            node.length > 0
                ? new this({ data: node.first().data() } as NodeModelDefinition, cy)
                : this.create(
                      {
                          carrier: ealn.data.carrier,
                          carrier_transport_unit: ealn.data.carrier_transport_unit
                              ? ealn.data.carrier_transport_unit
                              : ({
                                    id: 0,
                                    reference: '',
                                    specific_tu_type_id: 0,
                                    specific_tu_type_type: '',
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    type: 'Vessel',
                                    pseudo: true,
                                } as TransportUnit),
                          location: ealn.data.location,
                          moveType: mt,
                          booking_reference: booking,
                          event_date_log: [
                              {
                                  reading: null, // When is the TU arriving / departing
                                  event_date: ealn.data.event_date, // When this prediction was made
                                  actual: ealn.data.actual,
                              },
                          ],
                          containers: [ealn.data.transport_unit],
                      },
                      cy,
                  );

        // Create an edge between the EALN and the LBN
        cy.add({
            data: {
                source: ealn.id,
                target: theNode.id,
            },
        });
        return theNode;
    }

    public static all(cy: cytoscape.Core): LocationBorderNode[] {
        return NodeModel.allModelDefinitions(this.TYPE, cy).map((e) => {
            return new this(e, cy);
        });
    }

    /**
     *
     * down = further in the transport plan
     * up = earlier in the transport plan
     */
    public streamNodes(direction: 'upstream' | 'downstream'): LocationBorderNode[] {
        const init: { depth: number; nodes: LocationBorderNode[] } = { depth: 0, nodes: [] };
        this.streamNodesNoStack(direction, init);
        return init.nodes;
    }

    private streamNodesNoStack(
        direction: 'upstream' | 'downstream',
        parentNodes: { depth: number; nodes: LocationBorderNode[] },
    ): void {
        if (parentNodes.depth > 100) {
            // shortcircuit break
            return;
        }
        const eDirection = direction === 'upstream' ? 'target' : 'source';
        const relevantEdges = this.cy
            .edges()
            .filter((e) => e.data()[eDirection] === this.id)
            .filter(
                (e) =>
                    e.data().type === LocationBorderNode.NEXT_LOCATION_EALN_EDGE ||
                    e.data().type === LocationBorderNode.INT_LOCATION_EALN_EDGE,
            );
        if (relevantEdges.length === 0) {
            return;
        }
        const otherNodeId = relevantEdges.first().data()[eDirection === 'source' ? 'target' : 'source'];
        // console.log('other', this.cy.$id(otherNodeId).data());
        const eDirectedNode = new LocationBorderNode({ data: this.cy.$id(otherNodeId).data() }, this.cy);
        parentNodes.nodes.push(eDirectedNode);
        parentNodes.depth++;
        eDirectedNode.streamNodesNoStack(direction, parentNodes);
    }
}
