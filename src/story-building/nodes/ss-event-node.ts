import cytoscape from 'cytoscape';

import { DataObject } from '../../types/data-object';
import { Locks } from '../../types/docky-shipment-status-types';
import { NodeModel, NodeModelDefinition } from './node-model';

export class SSEventNode extends NodeModel {
    public static TYPE = 'SSEventNode';
    public static create(ss: Locks, additional_data: DataObject, cy: cytoscape.Core): SSEventNode {
        const node = new this(
            {
                data: {
                    type: this.TYPE,
                    lock_statuses: ss,
                    ...additional_data,
                    name: ss.location.name,
                },
            },
            cy,
        );
        return node;
    }

    public static firstOrCreate(ss: Locks, cy: cytoscape.Core): SSEventNode {
        const node = cy.nodes().filter((e) => e.data('type') === this.TYPE && e.data().lock_statuses?.id === ss.id);
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
