import { assert } from 'chai';
import fs from 'fs';
import { StoryBuildingCore } from '../story-building/story-building-core';
import { EventAtLocationNode } from '../story-building/nodes/event-at-location-node';

describe('Story Building Core concern ', () => {
    it('should create component', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync('assets/test-files/test_ss_1.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);

        // then
        assert.ok(cy);
    });

    it('basic tests for story', async () => {
        const promises = [...Array(16).keys()].map(async (key) => {
            if (key === 0) {
                return true;
            }
            // given
            const execContext = JSON.parse(fs.readFileSync('assets/test-files/test_ss_' + key + '.txt').toString());

            // when
            const cy = await new StoryBuildingCore().execute(execContext);

            // then
            assert.ok(cy);

            // All EventAtLocationNodes can have max 1 incoming and max 1 outgoing EALN Next

            const inNodes: string[] = [];
            const outNodes: string[] = [];

            cy.edges()
                .filter((e) => e.data().type === EventAtLocationNode.NEXT_EVENT_EALN_EDGE)
                .reduce((carry, item) => {
                    if (item.data().destination) {
                        inNodes.push(item.data().destination);
                    }
                    if (item.data().source) {
                        outNodes.push(item.data().source);
                    }
                    return true;
                }, true);

            const duplicates = [inNodes, outNodes].reduce((carry, nodes) => {
                return carry || nodes.filter((item, index) => nodes.indexOf(item) != index).length > 0;
            }, false);

            assert.isFalse(duplicates, 'Duplicate IN/OUT for key ' + key);

            return true;
        });

        await Promise.all(promises);
        assert.ok(true);
    }).timeout(10000);

    it('should create collection of one or more elements (nodes and edges)', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync('assets/test-files/test_ss_1.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);

        // then
        assert.ok(EventAtLocationNode.all(cy).filter((e) => e.data.type === 'EventAtLocationNode').length > 0);
        assert.ok(cy.edges().length > 0);
    });
});
