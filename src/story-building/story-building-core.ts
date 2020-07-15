import cytoscape, { NodeDefinition, EdgeDefinition, NodeSingular } from 'cytoscape';

import { DockyShipmentStatus, Location } from '../types/docky-shipment-status-types';
import { LocationNode } from './nodes/location-node';
import { SSEventNode } from './nodes/ss-event-node';
import { EventAtLocationNode } from './nodes/event-at-location-node';
import { NodeModel } from './nodes/node-model';
import { LocationBorderNode } from './nodes/location-border-node';

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

        // Make the LBNs (Location Border Nodes) by walking over each
        EventAtLocationNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .forEach((e) => {
                // this means we're looking at a new TP for a specific TU
                const downStreamNodes = e.streamNodes('downstream');
                let previousNode = e;
                let previousLBN: LocationBorderNode | null = null;
                downStreamNodes.forEach((n) => {
                    if (n.data.location.id !== previousNode.data.location.id) {
                        // the previous was an outgoing and we are an incoming
                        const nout = LocationBorderNode.firstOrCreate('OUT', previousNode, cy);
                        const nin = LocationBorderNode.firstOrCreate('IN', n, cy);

                        // Connect these nodes
                        cy.add({
                            data: {
                                source: nout.id,
                                target: nin.id,
                            },
                        });
                        if (previousLBN) {
                            cy.add({
                                data: {
                                    source: previousLBN.id,
                                    target: nout.id,
                                },
                            });
                        }
                        previousLBN = nin;
                    }
                    previousNode = n;
                });
            });

        return cy;
    }
}
