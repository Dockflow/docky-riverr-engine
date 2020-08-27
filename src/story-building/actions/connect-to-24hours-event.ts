import { EventAtLocationNode } from '../nodes/event-at-location-node';
import { EdgeDefinition } from 'cytoscape';

export function connectToNext24HoursEvent(currentNode: EventAtLocationNode): void {
    while (currentNode && currentNode.streamNodes('downstream')) {
        const nextNode = currentNode.streamNodes('downstream').shift(); // take the downstream event of current node.
        const replaceNode = EventAtLocationNode.all(currentNode.cy)
            .filter((e) => e.id !== currentNode.id)
            .filter((e) => {
                // find nodes within 30 hours of current node.
                const diff_milliseconds = Math.abs(
                    Date.parse(currentNode.data.event_date) - Date.parse(e.data.event_date),
                );
                const diff_hours = diff_milliseconds / 3600000;
                if (diff_hours > 0 && diff_hours < 30) {
                    return e;
                }
            })
            .filter((e) => e.data.transport_unit && e.data.transport_unit.id === currentNode.data.transport_unit.id)
            .filter((i) => {
                // check any node between current node and downstream event according to transhipment oder.
                const transhipmentOrder = EventAtLocationNode.transhipmentOrder;
                if (currentNode.data.status_code.status_code === i.data.status_code.status_code) {
                    return 0;
                }
                if (
                    !transhipmentOrder.includes(i.data.status_code.status_code) ||
                    !transhipmentOrder.includes(currentNode.data.status_code.status_code) ||
                    !transhipmentOrder.includes(nextNode?.data.status_code.status_code)
                ) {
                    return 0;
                }

                const iOrder = transhipmentOrder.indexOf(i.data.status_code.status_code);
                const aOrder = transhipmentOrder.indexOf(currentNode.data.status_code.status_code);
                const bOrder = transhipmentOrder.indexOf(nextNode?.data.status_code.status_code);

                // if there exist any node between current node and downstream node we take it as replace node.
                if (iOrder > aOrder && bOrder > iOrder) return i;
            })
            .shift();

        if (replaceNode && nextNode) {
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
            replaceNode.cy.remove(replaceNode.cy.$id(targetEdge.data().id));

            if (sourceEdge.length > 0) {
                // remove edge which has replace node as an source node.
                replaceNode.cy.remove(replaceNode.cy.$id(sourceEdge.data().id));

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
                .filter((e) => e.data().source === currentNode.data.id && e.data().target === nextNode.data.id);

            // remove edge which is connected to current node and downstream node.
            currentNode.cy.remove(currentNode.cy.$id(currentEdge.data().id));

            // connect replace node betweeen current node and downstream node.
            replaceNode.cy.add({
                data: {
                    source: currentNode.id,
                    target: replaceNode.id,
                    type: EventAtLocationNode.NEXT_EVENT_EALN_EDGE,
                    graph_source: 'connectToNextEvent-function',
                },
            } as EdgeDefinition);

            replaceNode.cy.add({
                data: {
                    source: replaceNode.id,
                    target: nextNode?.id,
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
