import cytoscape, { EdgeDefinition, EdgeCollection, NodeCollection } from 'cytoscape';

import { Location, StatusCode, TransportUnit, DockyShipmentStatus } from '../../types/docky-shipment-status-types';
import { NodeModel, NodeModelDefinition } from './node-model';
import { LocationNode } from './location-node';
import { SSEventNode } from './ss-event-node';
import { DistanceCalculator } from '../../core/distance-calculator';
import { FileTransportOptions } from 'winston/lib/winston/transports';

export type EventAtLocationKeyData = {
    status_code: StatusCode;
    location: Location;
    transport_unit: TransportUnit;
};

type EventDateLogEntry = {
    event_date: string;
    predicted_at: string;
    actual: boolean;
    source_shipment_statuses: DockyShipmentStatus;
};

export class EventAtLocationNode extends NodeModel {
    public static TYPE = 'EventAtLocationNode';
    public static DECLARING_SS_EDGE_TYPE = 'DECLARING_SS_EDGE_TYPE';
    public static NEXT_EVENT_EALN_EDGE = 'NEXT_EVENT_EALN_EDGE';

    public static naturalOrder = ['GE', 'GN', 'AE', 'VD', 'VA', 'UV', 'GT', 'GR'];

    // public location: Location | null = null;
    // public status_code: StatusCode | null = null;
    // public transport_unit: TransportUnit | null = null;

    public static create(creationData: EventAtLocationKeyData, cy: cytoscape.Core): EventAtLocationNode {
        const node = new this(
            {
                data: {
                    type: this.TYPE,
                    name: creationData.status_code.message,
                    ...creationData,
                    parent: LocationNode.firstOrCreate(creationData.location, cy).id,
                },
                classes: this.TYPE,
            },
            cy,
        );
        return node;
    }

    public static firstOrCreate(ealkd: EventAtLocationKeyData, cy: cytoscape.Core): EventAtLocationNode {
        const node = cy
            .nodes()
            .filter(
                (e) =>
                    e.data('type') === this.TYPE &&
                    e.data().status_code.status_code === ealkd.status_code.status_code &&
                    e.data().location.id === ealkd.location.id &&
                    e.data().transport_unit.id === ealkd.transport_unit.id,
            );
        return node.length > 0
            ? new this({ data: node.first().data() } as NodeModelDefinition, cy)
            : this.create(ealkd, cy);
    }

    public static createFromShipmentStatus(ss: DockyShipmentStatus, cy: cytoscape.Core): EventAtLocationNode {
        // Create the node
        const ealc = EventAtLocationNode.firstOrCreate(
            {
                location: ss.location,
                status_code: ss.status_code,
                transport_unit: ss.transport_unit,
            },
            cy,
        );

        // Add an directed edge to the created
        cy.add({
            data: {
                source: SSEventNode.firstOrCreate(ss, cy).id,
                target: ealc.id,
                type: this.DECLARING_SS_EDGE_TYPE,
                graph_source: 'inline_edge_add' + this.DECLARING_SS_EDGE_TYPE,
            },
        } as EdgeDefinition);
        return ealc;
    }

    public static all(cy: cytoscape.Core): EventAtLocationNode[] {
        return NodeModel.allModelDefinitions(this.TYPE, cy).map((e) => {
            return new this(e, cy);
        });
    }

    /**
     * Function will calculate the confidence intervals + event_date + actual true or false
     */
    public event_date: string | null = null;
    public predicted_at: string | null = null;
    public actual = false;
    public event_date_log: EventDateLogEntry[] = [];

    public calculateBasicAttributes(): void {
        //make the event date log

        //console.log('cpount1', this.cy.edges().filter((e) => e.data().target === this.id).length);
        this.cy
            .edges()
            .filter((e) => e.data('target') === this.id)
            .filter((e) => e.data('type') === EventAtLocationNode.DECLARING_SS_EDGE_TYPE)
            .forEach((e) => {
                const ssNode = this.cy.$id(e.data('source'));
                this.event_date_log.push({
                    actual: ssNode.data().shipment_status.actual,
                    event_date: ssNode.data().shipment_status.event_date,
                    predicted_at: ssNode.data().shipment_status.created_at,
                    source_shipment_statuses: ssNode.data().shipment_status.shipment_status,
                });
            });

        // High end ML & AI for getting the event_date
        let credibleEvent: EventDateLogEntry | undefined;
        let run = 0;
        do {
            credibleEvent = this.event_date_log
                .filter((e) => e.actual === (run === 0 ? true : false))
                .sort((a, b) => {
                    return a.predicted_at > b.predicted_at ? 1 : -1;
                })
                .pop();
            run++;
        } while (!credibleEvent && run === 1);

        if (credibleEvent) {
            this.actual = credibleEvent.actual;
            this.event_date = credibleEvent.event_date;
            this.predicted_at = credibleEvent.predicted_at;
        }

        this.save({
            actual: this.actual,
            event_date: this.event_date,
            predicted_at: this.event_date,
            event_date_log: this.event_date_log,
        });
    }

    public static sortByNaturalShipmentOrder(a: EventAtLocationNode, b: EventAtLocationNode): number {
        const naturalOrder = EventAtLocationNode.naturalOrder;
        if (a.data.status_code.status_code === b.data.status_code.status_code) {
            return 0;
        }
        if (
            !naturalOrder.includes(a.data.status_code.status_code) ||
            !naturalOrder.includes(b.data.status_code.status_code)
        ) {
            return 0;
        }

        return naturalOrder.indexOf(a.data.status_code.status_code) >
            naturalOrder.indexOf(b.data.status_code.status_code)
            ? 1
            : -1;
    }

    public connectToNextEvent(): void {
        // We will check this event and connect it to the nearest other event
        if (this.data.event_date === null) {
            return;
        }
        const nextEvent = EventAtLocationNode.all(this.cy)
            .filter((e) => e.id !== this.id)
            .filter((e) => e.data.event_date && e.data.event_date >= this.data.event_date)
            .filter((e) => e.data.transport_unit && e.data.transport_unit.id === this.data.transport_unit.id)
            .sort((a, b) => {
                const naturalOrder = EventAtLocationNode.naturalOrder;
                if (a.data.status_code.status_code === b.data.status_code.status_code) {
                    return 0;
                }
                if (
                    !naturalOrder.includes(a.data.status_code.status_code) ||
                    !naturalOrder.includes(b.data.status_code.status_code)
                ) {
                    return 0;
                }

                const aOrder = naturalOrder.indexOf(a.data.status_code.status_code);
                const bOrder = naturalOrder.indexOf(b.data.status_code.status_code);
                const iOrder = naturalOrder.indexOf(this.data.status_code.status_code);
                if (
                    a.data.location.id !== b.data.location.id ||
                    a.data.event_date !== b.data.event_date ||
                    iOrder === -1 ||
                    (aOrder >= iOrder && bOrder >= iOrder) ||
                    (aOrder <= iOrder && bOrder <= iOrder)
                ) {
                    return naturalOrder.indexOf(a.data.status_code.status_code) >
                        naturalOrder.indexOf(b.data.status_code.status_code)
                        ? 1
                        : -1;
                }

                // Prefer higher natural orders

                return aOrder > iOrder ? -1 : 1;
            })
            .sort((a, b) => {
                // sort by date
                if (a.data.event_date! === b.data.event_date!) {
                    return 0;
                }
                return a.data.event_date! > b.data.event_date! ? 1 : -1;
            })

            .filter((n) => {
                // I cannot connect to events that already have an incoming NEXT EVENT edge
                return (
                    this.cy
                        .edges()
                        .filter((e) => e.data().type === EventAtLocationNode.NEXT_EVENT_EALN_EDGE)
                        .filter((e) => e.data().target === n.data.id).length === 0
                );
            })

            .shift();
        if (nextEvent) {
            this.cy.add({
                data: {
                    source: this.id,
                    target: nextEvent.id,
                    type: EventAtLocationNode.NEXT_EVENT_EALN_EDGE,
                    graph_source: 'connectToNextEvent-function',
                },
            } as EdgeDefinition);
        }
    }

    public getCredibilityFactor(): {
        incoming_declaring_edges: EdgeCollection;
        latest_prediction_date: string | null;
    } {
        return {
            incoming_declaring_edges: this.cy
                .edges()
                .filter((e) => e.data().type === EventAtLocationNode.DECLARING_SS_EDGE_TYPE)
                .filter((e) => e.data().target === this.id),
            latest_prediction_date: this.predicted_at,
        };
    }

    public isMoreCredibleThan(ealn: EventAtLocationNode): boolean {
        // Events that have more incoming declaring edges are more credible
        if (
            this.getCredibilityFactor().incoming_declaring_edges.length !==
            ealn.getCredibilityFactor().incoming_declaring_edges.length
        ) {
            return (
                this.getCredibilityFactor().incoming_declaring_edges.length >
                ealn.getCredibilityFactor().incoming_declaring_edges.length
            );
        }

        // Events that are in a location where more things happen are more credible
        const myParentLocationEventCount = this.cy
            .nodes()
            .filter((e) => e.data().type && e.data().type === EventAtLocationNode.TYPE)
            .filter((e) => e.data().parent && e.data().parent === this.data.parent)
            .filter((e) => e.data().location && e.data().location.id === this.data.location.id).length;
        const theirParentLocationEventCount = this.cy
            .nodes()
            .filter((e) => e.data().type && e.data().type === EventAtLocationNode.TYPE)
            .filter((e) => e.data().parent && e.data().parent === ealn.data.parent)
            .filter((e) => e.data().location && e.data().location.id === ealn.data.location.id).length;

        if (myParentLocationEventCount !== theirParentLocationEventCount) {
            return myParentLocationEventCount > theirParentLocationEventCount;
        }

        // Catch ties -> choose the one with the lowest location_id
        return this.data.location.id < ealn.data().locaton.id;
    }

    /**
     * I will merge my events to a EALN nearby if:
     * - The event status code is the same
     * - The location is less than 15km away
     * - The EALN is more credible (as defined in `isMoreCredibleThan`)
     */
    public mergeToMainLocationIfrequired(): void {
        const moreCredibleEvent = EventAtLocationNode.all(this.cy)
            .filter((e) => e.id !== this.id)
            .filter((e) => e.data.transport_unit && e.data.transport_unit.id === this.data.transport_unit.id)
            .filter((e) => e.data.status_code && e.data.status_code.status_code === this.data.status_code.status_code)
            .filter((e) => {
                return DistanceCalculator.distanceinKilometers(e.data.location.point, this.data.location.point) <= 25;
            })
            .filter((e) => {
                return e.isMoreCredibleThan(this);
            })
            .shift();

        if (moreCredibleEvent) {
            // Merge my incoming declaring edges to other EALN
            this.getIncomingSSEventNodeIds().forEach((sourceId) => {
                this.cy.add({
                    data: {
                        source: sourceId,
                        target: moreCredibleEvent.id,
                        type: EventAtLocationNode.DECLARING_SS_EDGE_TYPE,
                        graph_source: 'mergeToMainLocationIfrequired',
                    },
                } as EdgeDefinition);
            });

            // For the enriched EALN, recalculate
            moreCredibleEvent.calculateBasicAttributes();

            // Delete myself
            this.cy.remove(this.cy.$id(this.id));
        }
    }

    public getIncomingSSEventNodeIds(): string[] {
        return this.cy
            .edges()
            .filter((e) => e.data().type === EventAtLocationNode.DECLARING_SS_EDGE_TYPE)
            .filter((e) => e.data().target === this.id)
            .map((e) => e.data().source as string);
    }

    /**
     *
     * down = further in the transport plan
     * up = earlier in the transport plan
     */
    public streamNodes(direction: 'upstream' | 'downstream'): EventAtLocationNode[] {
        // Make an empty collection
        const nodes: EventAtLocationNode[] = [];
        const eDirection = direction === 'upstream' ? 'target' : 'source';
        const relevantEdges = this.cy
            .edges()
            .filter(
                (e) => e.data().type === EventAtLocationNode.NEXT_EVENT_EALN_EDGE && e.data()[eDirection] === this.id,
            );
        if (relevantEdges.length === 0) {
            return nodes;
        }
        const otherNodeId = relevantEdges.first().data()[eDirection === 'source' ? 'target' : 'source'];
        // console.log('other', this.cy.$id(otherNodeId).data());
        const eDirectedNode = new EventAtLocationNode({ data: this.cy.$id(otherNodeId).data() }, this.cy);

        nodes.push(eDirectedNode);

        // Also push the streamedNodes from this node - recursive
        nodes.push(...eDirectedNode.streamNodes(direction));

        return nodes.filter((e) => this.cy.hasElementWithId(e.id));
    }
}
