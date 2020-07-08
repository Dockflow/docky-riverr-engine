import cytoscape, { NodeDefinition, EdgeDefinition, NodeSingular } from 'cytoscape';

import { DockyShipmentStatus, Location } from '../types/docky-shipment-status-types';

export class StoryBuildingCore {
    public async execute(shipmentStatuses: DockyShipmentStatus[]): Promise<any> {
        const cy = cytoscape();

        /**
         * First we will add all locations
         */
        shipmentStatuses
            .filter((e) => e.location !== null)
            .forEach((ss) => {
                if (cy.nodes().filter((e) => e.data().location && e.data().location.id == ss.location_id).length > 0) {
                    // We already have this location in the graph
                    return;
                }
                const node = cy.add({
                    data: { name: ss.location.name, location: ss.location },
                    grabbable: true,
                } as NodeDefinition);
            });

        // Then we add all events that have locations to the correct locations

        shipmentStatuses
            .filter((e) => e.location !== null)
            .forEach((ss) => {
                const location = cy
                    .nodes()
                    .filter((e) => e.data().location && e.data().location.id == ss.location_id)
                    .first();
                const node = cy.add({
                    data: { name: ss.message, ss: ss, parent: location?.id() },
                    grabbable: true,
                } as NodeDefinition);
            });
        return cy.json();
    }
}
