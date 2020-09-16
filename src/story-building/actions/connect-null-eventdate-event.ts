import { EventAtLocationNode } from '../nodes/event-at-location-node';
import { EdgeDefinition } from 'cytoscape';

export function connectToNullEventdateEvent(currentNode: EventAtLocationNode): void {
    while (currentNode && currentNode.streamNodes('downstream')) {
        const nextNode = currentNode.streamNodes('downstream').shift(); // take the downstream event of current node.
        const replaceNode = EventAtLocationNode.all(currentNode.cy)
            .filter((e) => e.id !== currentNode.id)
            .filter((e) => e.data.transport_unit && e.data.transport_unit.id === currentNode.data.transport_unit.id)
            .filter((i) => {
                // check any node between current node and downstream event according to transhipment oder.
                const naturalOrder = EventAtLocationNode.naturalOrder;
                if (currentNode.data.status_code.status_code === i.data.status_code.status_code) {
                    return 0;
                }
                if (
                    !naturalOrder.includes(i.data.status_code.status_code) ||
                    !naturalOrder.includes(currentNode.data.status_code.status_code)
                ) {
                    return 0;
                }

                const iOrder = naturalOrder.indexOf(i.data.status_code.status_code);
                const aOrder = naturalOrder.indexOf(currentNode.data.status_code.status_code);
                const bOrder = naturalOrder.indexOf(nextNode?.data.status_code.status_code);

                // if there exist any node between current node and downstream node we take it as replace node.
                if (bOrder > -1 && iOrder > aOrder && bOrder > iOrder) return i;

                if (bOrder < 0 && iOrder > aOrder) return i;
            })
            .shift();

        if (replaceNode) {
            // find edge which has replace node as an source node.
            const sourceEdge = currentNode.cy
                .edges()
                .filter((e) => e.data().type === EventAtLocationNode.NEXT_EVENT_EALN_EDGE)
                .filter((e) => e.data().source === replaceNode.data.id);

            // find edge which has replace node as an target node.
            const targetEdge = currentNode.cy
                .edges()
                .filter((e) => e.data().type === EventAtLocationNode.NEXT_EVENT_EALN_EDGE)
                .filter((e) => e.data().target === replaceNode.data.id);

            // remove edge which has replace node as an target node.
            if (targetEdge.data()?.id) replaceNode.cy.remove(replaceNode.cy.$id(targetEdge.data().id));

            // remove edge which has replace node as an source node.
            if (sourceEdge.data()?.id) replaceNode.cy.remove(replaceNode.cy.$id(sourceEdge.data().id));

            if (targetEdge.data()?.source && sourceEdge.data()?.target) {
                // in oder to keep the tradeflow, connect edges together which connected to replace node
                replaceNode.cy.add({
                    data: {
                        source: targetEdge.data().source,
                        target: sourceEdge.data().target,
                        type: EventAtLocationNode.NEXT_EVENT_EALN_EDGE,
                        graph_source: 'connectToNextEvent-function',
                    },
                } as EdgeDefinition);
            }

            const currentEdge = currentNode.cy
                .edges()
                .filter((e) => e.data().type === EventAtLocationNode.NEXT_EVENT_EALN_EDGE)
                .filter((e) => e.data().source === currentNode.data.id && e.data().target === nextNode?.data?.id);

            // remove edge which is connected to current node and downstream node.
            if (currentEdge.data()?.id) currentNode.cy.remove(currentNode.cy.$id(currentEdge.data().id));

            // connect replace node betweeen current node and downstream node.
            replaceNode.cy.add({
                data: {
                    source: currentNode.id,
                    target: replaceNode.id,
                    type: EventAtLocationNode.NEXT_EVENT_EALN_EDGE,
                    graph_source: 'connectToNextEvent-function',
                },
            } as EdgeDefinition);

            nextNode &&
                replaceNode.cy.add({
                    data: {
                        source: replaceNode.id,
                        target: nextNode.id,
                        type: EventAtLocationNode.NEXT_EVENT_EALN_EDGE,
                        graph_source: 'connectToNextEvent-function',
                    },
                } as EdgeDefinition);
            currentNode = replaceNode;
        } else {
            // if no replace node then current node should be downstream node in oder to continue iteration.
            currentNode = nextNode!;
        }
    }
}
