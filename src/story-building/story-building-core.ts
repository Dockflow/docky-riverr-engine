import cytoscape from 'cytoscape';

import { ExecutionContext } from '../types/execution-context';
import { EventAtLocationNode } from './nodes/event-at-location-node';
import { LocationBorderNode } from './nodes/location-border-node';
import { LocationNode } from './nodes/location-node';
import { SSEventNode } from './nodes/ss-event-node';
import { connectToNextEvent } from '../story-building/actions/connect-to-next-event';
import { connectToNext24HoursEvent } from '../story-building/actions/connect-to-24hours-event';

export class StoryBuildingCore {
    public async execute(execContext: ExecutionContext): Promise<cytoscape.Core> {
        const cy = cytoscape();
        /**
         * First we will add all locations
         */
        execContext.shipment_statuses
            .filter((e) => e.location !== null)
            .forEach((ss) => {
                LocationNode.firstOrCreate(ss.location, cy);
            });

        // Then we add all events that have locations to the correct locations

        execContext.shipment_statuses
            .filter((e) => e.location !== null)
            .forEach((ss) => {
                const location = LocationNode.firstOrCreate(ss.location, cy);
                SSEventNode.create(ss, { parent: location.id }, cy);
            });

        // Make event-nodes per TU and per location and attach the basic SSs
        execContext.shipment_statuses
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
                connectToNextEvent(e);
            });

        // Connect each event to the next event within 24 hours
        EventAtLocationNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .forEach((e) => {
                connectToNext24HoursEvent(e);
            });

        // Set downstream actuals consistently
        // EventAtLocationNode.all(cy).forEach((e) => {
        //     e.setActualsConsitentlyInStream();
        // });

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
                                carrier_transport_unit: nin.data.carrier_transport_unit,
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

        // Apply final styling
        EventAtLocationNode.all(cy).forEach((e) => e.finalStyling());

        return cy;
    }
}
