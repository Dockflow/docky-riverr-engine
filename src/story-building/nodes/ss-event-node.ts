import cytoscape, { NodeDefinition } from 'cytoscape';

import { DockyShipmentStatus } from '../../types/docky-shipment-status-types';
import { NodeModel, NodeModelDefinition } from './node-model';

export class SSEventNode extends NodeModel {
    public static TYPE = 'SSEventNode';
    public static create(ss: DockyShipmentStatus, additional_data: any, cy: cytoscape.Core) {
        const node = new this(
            {
                data: {
                    type: this.TYPE,
                    shipment_status: ss,
                    ...additional_data,
                    name: ss.message,
                },
            },
            cy,
        );
        return node;
    }

    public static firstOrCreate(ss: DockyShipmentStatus, cy: cytoscape.Core): SSEventNode {
        const node = cy.nodes().filter((e) => e.data('type') === this.TYPE && e.data().shipment_status?.id === ss.id);
        return node.length > 0
            ? new this({ data: node.first().data() } as NodeModelDefinition, cy)
            : this.create(ss, {}, cy);
    }

    public static all(cy: cytoscape.Core): SSEventNode[] {
        return NodeModel.allModelDefinitions(this.TYPE, cy).map((e) => {
            return new this(e, cy);
        });
    }
}
