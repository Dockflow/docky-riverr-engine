import cytoscape from 'cytoscape';

import { ExecutionContext } from '../types/execution-context';
import { EventAtLocationNode } from './nodes/event-at-location-node';
import { LocationBorderNode } from './nodes/location-border-node';
import { LocationNode } from './nodes/location-node';
import { SSEventNode } from './nodes/ss-event-node';
import { connectToNextEvent } from '../story-building/actions/connect-to-next-event';
import { connectToNext24HoursEvent } from '../story-building/actions/connect-to-24hours-event';
import { connectToNullEventdateEvent } from '../story-building/actions/connect-null-eventdate-event';
import { DistanceCalculator } from '../core/distance-calculator';
import { TransportUnit } from '../types/docky-shipment-status-types';

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

        // Connect each event to the null events
        EventAtLocationNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .forEach((e) => {
                connectToNullEventdateEvent(e);
            });

        // Set downstream actuals consistently
        // EventAtLocationNode.all(cy).forEach((e) => {
        //     e.setActualsConsitentlyInStream();
        // });

        // Make the LBNs (Location Border Nodes) by walking over each
        const booking_details = execContext.shipment_statuses.filter(
            (e) =>
                e.message == 'Booking details' &&
                e.specific_status.bill_of_lading_reference != null &&
                e.specific_status.booking_reference != null,
        );
        EventAtLocationNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .forEach((e) => {
                // this means we're looking at a new TP for a specific TU
                const downStreamNodes = e.streamNodes('downstream');
                let previousNode = e;
                let previousLBN: LocationBorderNode | null = null;
                downStreamNodes.forEach((n) => {
                    if (
                        n.data.location.id !== previousNode.data.location.id &&
                        DistanceCalculator.distanceinKilometers(
                            n.data.location.point,
                            previousNode.data.location.point,
                        ) > 20
                    ) {
                        // the previous was an outgoing and we are an incoming
                        const booking = booking_details
                            .filter(
                                (e) =>
                                    e.shipment_condition_reading_source_id ===
                                    n.data.shipment_condition_reading_source_id,
                            )
                            .shift()?.specific_status.booking_reference;
                        const nout = LocationBorderNode.firstOrCreate('OUT', previousNode, cy, booking ? booking : '');
                        const nin = LocationBorderNode.firstOrCreate('IN', n, cy, '');

                        // Connect these nodes
                        cy.add({
                            data: {
                                source: nout.id,
                                target: nin.id,
                                carrier_transport_unit: nin.data.carrier_transport_unit,
                                carrier: nin.data.carrier,
                                type: LocationBorderNode.NEXT_LOCATION_EALN_EDGE,
                            },
                        });
                        if (previousLBN) {
                            cy.add({
                                data: {
                                    source: previousLBN.id,
                                    target: nout.id,
                                    type: LocationBorderNode.INT_LOCATION_EALN_EDGE,
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
    /*
    Here we collect all ending nodes of all sea shipments.
    */
    public getAllBorderNodes(cy: cytoscape.Core): LocationBorderNode[] {
        const endingNodes: LocationBorderNode[] = LocationBorderNode.all(cy).filter(
            (e) => e.streamNodes('downstream').length === 0,
        );

        const starting_containers = LocationBorderNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .reduce((starting_containers, end_node) => {
                starting_containers += end_node.data.containers.length;
                return starting_containers;
            }, 0);

        let ending_containers = endingNodes.reduce((ending_containers, end_node) => {
            ending_containers += end_node.data.containers.length;
            return ending_containers;
        }, 0);

        if (starting_containers > ending_containers) {
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
                        ending_containers += node.data.containers.length - node_containers;
                        node_containers = node.data.containers.length;
                    }

                    if (starting_containers <= ending_containers) return;
                });
            });
        }
        return endingNodes;
    }

    /*
    Here we check ending Node has next Node containers if there's any then we filter it.
    */
    public getContainers(endingNode: LocationBorderNode): TransportUnit[] {
        if (endingNode.streamNodes('downstream').length === 0) return endingNode.data.containers;

        const donwstream_containers = endingNode.streamNodes('downstream')?.[0].data.containers;
        return endingNode.data.containers.filter((x: TransportUnit) => {
            if (donwstream_containers.filter((e: TransportUnit) => e.reference === x.reference).length == 0) return x;
        });
    }
}
