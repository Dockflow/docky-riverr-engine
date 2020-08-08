import cytoscape from 'cytoscape';

import { Location, TransportUnit } from '../../types/docky-shipment-status-types';
import { EventAtLocationNode } from './event-at-location-node';
import { LocationNode } from './location-node';
import { NodeModel, NodeModelDefinition } from './node-model';

export type MoveType = 'IN' | 'OUT';
export type LocationBorderNodeCharacteristics = {
    location: Location;
    moveType: MoveType;
    carrier_transport_unit: null | TransportUnit;
};

export class LocationBorderNode extends NodeModel {
    public static TYPE = 'LocationBorderNode';

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

    public static firstOrCreate(mt: MoveType, ealn: EventAtLocationNode, cy: cytoscape.Core): LocationBorderNode {
        const node = cy
            .nodes()
            .filter((e) => e.data('type') === this.TYPE)
            .filter((e) => e.data().location.id === ealn.data.location.id)
            .filter((e) => e.data().moveType === mt)
            .filter((e) => e.data().carrier_transport_unit === null);
        const theNode =
            node.length > 0
                ? new this({ data: node.first().data() } as NodeModelDefinition, cy)
                : this.create(
                      {
                          carrier_transport_unit: null,
                          location: ealn.data.location,
                          moveType: mt,
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
}
