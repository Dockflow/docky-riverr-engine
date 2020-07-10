import { EdgeDefinition } from 'cytoscape';

export type EdgeModelDefinition = EdgeDefinition;

export abstract class NodeModel implements EdgeDefinition {
    public id = '';
    public grabbable = true;
    public data: any = {};

    public cy: cytoscape.Core;

    constructor(definition: EdgeModelDefinition, cy: cytoscape.Core) {
        Object.assign(this, definition);
        Object.assign(this, definition.data);
        if (
            !definition.data ||
            !definition.data.id ||
            (definition.data.id && !cy.hasElementWithId(definition.data.id))
        ) {
            Object.assign(this, cy.add(this));
        }
        this.cy = cy;
    }

    public save(): void {
        this.cy.elements().$id(this.id).data(this.data);
    }
}
