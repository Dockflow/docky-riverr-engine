import cytoscape, { EdgeDefinition } from 'cytoscape';

import { Location, StatusCode, TransportUnit, DockyShipmentStatus } from '../../types/docky-shipment-status-types';
import { NodeModel, NodeModelDefinition } from './node-model';
import { LocationNode } from './location-node';
import { SSEventNode } from './ss-event-node';

export type EventAtLocationKeyData = {
    statusCode: StatusCode;
    location: Location;
    transportUnit: TransportUnit;
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

    public static create(creationData: EventAtLocationKeyData, cy: cytoscape.Core): EventAtLocationNode {
        const node = new this(
            {
                data: {
                    type: this.TYPE,
                    name: creationData.statusCode.message,
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
                    e.data().statusCode.id === ealkd.statusCode.id &&
                    e.data().location.id === ealkd.location.id &&
                    e.data().transportUnit.id === ealkd.transportUnit.id,
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
                statusCode: ss.status_code,
                transportUnit: ss.transport_unit,
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
    public actual = false;
    public event_date_log: EventDateLogEntry[] = [];

    public calculateBasicAttributes() {
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
        }

        this.save({
            actual: this.actual,
            event_date: this.event_date,
            event_date_log: this.event_date_log,
        });
    }

    public connectToNextEvent() {
        // We will check this event and connect it to the nearest other event
        if (this.data.event_date === null) {
            return;
        }
        const nextEvent = EventAtLocationNode.all(this.cy)
            .filter((e) => e.id !== this.id)
            .filter((e) => e.data.event_date && e.data.event_date >= this.data.event_date)
            .sort((a, b) => {
                return a.data.event_date! > b.data.event_date! ? 1 : -1;
            })
            .shift();
        if (nextEvent) {
            this.cy.add({
                data: {
                    source: this.id,
                    target: nextEvent.id,
                    type: 'TODO',
                    graph_source: 'connectToNextEvent',
                },
            } as EdgeDefinition);
        }
    }
}
