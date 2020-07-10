import { NodeDefinition } from 'cytoscape';

export type NodeModelDefinition = NodeDefinition & {
    data: {
        name: string;
        type: string;
    };
};

export abstract class NodeModel implements NodeDefinition {
    public id = '';
    public grabbable = true;
    public data: any = {};
    public cy: cytoscape.Core;

    constructor(definition: NodeModelDefinition, cy: cytoscape.Core) {
        Object.assign(this, definition);
        Object.assign(this, definition.data);
        this.data.graph_source = 'NodeModel';
        if (
            !definition.data ||
            !definition.data.id ||
            definition.data.id === '' ||
            (definition.data.id && !cy.hasElementWithId(definition.data.id))
        ) {
            const added = cy.add(this);
            Object.assign(this, added);
            Object.assign(this, added.data());
        }
        this.cy = cy;
    }

    public save(data: any): void {
        Object.assign(this.data, data);
        this.cy.elements().$id(this.id).data(this.data);
    }

    public static allModelDefinitions(type: string, cy: cytoscape.Core): NodeModelDefinition[] {
        return cy
            .nodes()
            .filter((e) => e.data('type') === type)
            .map((node) => {
                return { data: node.data() };
            });
    }
}
