import cytoscape, { NodeDefinition, EdgeDefinition, NodeSingular } from 'cytoscape';

import { DockyShipmentStatus, Location } from '../types/docky-shipment-status-types';
import { LocationNode } from './nodes/location-node';
import { SSEventNode } from './nodes/ss-event-node';
import { EventAtLocationNode } from './nodes/event-at-location-node';
import { NodeModel } from './nodes/node-model';

export class StoryBuildingCore {
    public async execute(shipmentStatuses: DockyShipmentStatus[]): Promise<cytoscape.Core> {
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
        EventAtLocationNode.all(cy).forEach((e) => {
            e.calculateBasicAttributes();
        });

        // If we have the same event happening in a location that is near, then it's prolly the same event
        EventAtLocationNode.all(cy).forEach((e) => {
            if (cy.hasElementWithId(e.id)) {
                e.mergeToMainLocationIfrequired();
            }
        });

        // Connect each event to the next event
        EventAtLocationNode.all(cy)
            .sort(EventAtLocationNode.sortByNaturalShipmentOrder)
            .forEach((e) => {
                e.connectToNextEvent();
            });

        return cy;
    }
}
