import cytoscape, { NodeDefinition, EdgeDefinition, NodeSingular } from 'cytoscape';

import { DockyShipmentStatus, Location } from '../types/docky-shipment-status-types';
import { LocationNode } from './nodes/location-node';
import { SSEventNode } from './nodes/ss-event-node';
import { EventAtLocationNode } from './nodes/event-at-location-node';
import { NodeModel } from './nodes/node-model';

export class StoryBuildingCore {
    public async execute(shipmentStatuses: DockyShipmentStatus[]): Promise<any> {
        const cy = cytoscape();

        /**
         * First we will add all locations
         */
        shipmentStatuses
            .filter((e) => e.location !== null)
            .forEach((ss) => {
                LocationNode.firstOrCreate(ss.location, cy);
            });

        // Then we add all events that have locations to the correct locations

        shipmentStatuses
            .filter((e) => e.location !== null)
            .forEach((ss) => {
                const location = LocationNode.firstOrCreate(ss.location, cy);
                SSEventNode.create(ss, { parent: location.id }, cy);
            });

        // Make event-nodes per TU and per location and attach the basic SSs
        shipmentStatuses
            .filter(
                (e) =>
                    e.location !== null &&
                    e.transport_unit !== null &&
                    e.status_code !== null &&
                    e.status_code.status_code !== '--',
            )
            .forEach((ss) => {
                EventAtLocationNode.createFromShipmentStatus(ss, cy);
            });

        // Make basic assumptions for these events
        EventAtLocationNode.all(cy)
            .map((e) => {
                e.calculateBasicAttributes();
                return e;
            })
            // .reduce<EventAtLocationNode[]>((carry, e) => {
            //     carry.push(e);
            //     return carry;
            // }, [])
            .map((e) => {
                e.connectToNextEvent();
            });

        // Connect events per TU

        return cy.json();
    }
}
