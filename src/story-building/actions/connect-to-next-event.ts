import { EdgeDefinition } from 'cytoscape';
import { EventAtLocationNode } from '../nodes/event-at-location-node';

export function connectToNextEvent(node: EventAtLocationNode): void {
    // We will check node event and connect it to the nearest other event
    if (node.data.event_date === null) {
        return;
    }
    const nextEvent = EventAtLocationNode.all(node.cy)
        .filter((e) => e.id !== node.id)
        .filter((e) => e.data.event_date && e.data.event_date >= node.data.event_date)
        .filter((e) => e.data.transport_unit && e.data.transport_unit.id === node.data.transport_unit.id)
        .sort((a, b) => {
            const naturalOrder = EventAtLocationNode.naturalOrder;
            if (a.data.status_code.status_code === b.data.status_code.status_code) {
                return 0;
            }
            if (
                !naturalOrder.includes(a.data.status_code.status_code) ||
                !naturalOrder.includes(b.data.status_code.status_code)
            ) {
                return 0;
            }

            const aOrder = naturalOrder.indexOf(a.data.status_code.status_code);
            const bOrder = naturalOrder.indexOf(b.data.status_code.status_code);
            const iOrder = naturalOrder.indexOf(node.data.status_code.status_code);
            if (
                a.data.location.id !== b.data.location.id ||
                a.data.event_date !== b.data.event_date ||
                iOrder === -1 ||
                (aOrder >= iOrder && bOrder >= iOrder) ||
                (aOrder <= iOrder && bOrder <= iOrder)
            ) {
                return naturalOrder.indexOf(a.data.status_code.status_code) >
                    naturalOrder.indexOf(b.data.status_code.status_code)
                    ? 1
                    : -1;
            }

            // Prefer higher natural orders

            return aOrder > iOrder ? -1 : 1;
        })
        .sort((a, b) => {
            // sort by date
            if (a.data.event_date! === b.data.event_date!) {
                return 0;
            }
            return a.data.event_date! > b.data.event_date! ? 1 : -1;
        })

        .filter((n) => {
            // I cannot connect to events that already have an incoming NEXT EVENT edge
            return (
                node.cy
                    .edges()
                    .filter((e) => e.data().type === EventAtLocationNode.NEXT_EVENT_EALN_EDGE)
                    .filter((e) => e.data().target === n.data.id).length === 0
            );
        })

        .shift();
    if (nextEvent) {
        node.cy.add({
            data: {
                source: node.id,
                target: nextEvent.id,
                type: EventAtLocationNode.NEXT_EVENT_EALN_EDGE,
                graph_source: 'connectToNextEvent-function',
            },
        } as EdgeDefinition);
    }
}
