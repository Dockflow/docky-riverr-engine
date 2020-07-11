import cytoscape, { NodeDefinition } from 'cytoscape';

import { Location } from '../../types/docky-shipment-status-types';
import { NodeModel, NodeModelDefinition } from './node-model';

export class LocationNode extends NodeModel {
    public static TYPE = 'LocationNode';
    public static create(location: Location, cy: cytoscape.Core): LocationNode {
        const node = new this(
            {
                data: {
                    type: this.TYPE,
                    name: location.name,
                    location: location,
                },
            },
            cy,
        );
        return node;
    }

    public static all(cy: cytoscape.Core): LocationNode[] {
        return NodeModel.allModelDefinitions(this.TYPE, cy).map((e) => {
            return new this(e, cy);
        });
    }

    public static firstOrCreate(location: Location, cy: cytoscape.Core): LocationNode {
        const node = cy.nodes().filter((e) => e.data('type') === this.TYPE && e.data().location?.id === location.id);
        return node.length > 0
            ? new this({ data: node.first().data() } as NodeModelDefinition, cy)
            : this.create(location, cy);
    }
}
