import { assert } from 'chai';
import fs from 'fs';
import { StoryBuildingCore } from '../story-building-core';
import { EventAtLocationNode } from '../nodes/event-at-location-node';

describe('Story Building specific ', () => {
    /**
    This is a tradeflow where the VA is between X and Y
    I: This is a tradeflow where there's inconsitent data about the transshipment
    O:
    - Storybuilder should correct this data
    - Groupedmilestones should display correct (i.c. means no extra VD in between)
    **/
    it('previous location cannot be downstream event', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/31020_inconsist_data.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);
        const downStreamNodes = EventAtLocationNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .shift()
            ?.streamNodes('downstream');
        const transportUnits = downStreamNodes?.filter(
            (e) => e.data.location.id === 58 && e.data.type === EventAtLocationNode.TYPE,
        );
        // then
        assert.ok(transportUnits);
        if (transportUnits) {
            assert.ok(transportUnits?.length === 4);
            const order = EventAtLocationNode.transhipmentOrder;
            assert.equal(transportUnits[0].data.status_code.status_code, order[0]);
            assert.equal(transportUnits[1].data.status_code.status_code, order[1]);
            assert.equal(transportUnits[2].data.status_code.status_code, order[6]);
            assert.equal(transportUnits[3].data.status_code.status_code, order[7]);
        }
    });
    it('should not generate out of order milestones', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/test_ss_19.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);
        const startNode = EventAtLocationNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .sort((a, b) => {
                const aCount = a.streamNodes('downstream').length;
                const bCount = b.streamNodes('downstream').length;

                return bCount - aCount;
            })
            .shift();
        assert.ok(startNode);
        if (!startNode) {
            throw new Error('Startnode not OK');
        }
        let outOfBruges = false;

        startNode.streamNodes('downstream').forEach((e) => {
            if (e.data.location && !(e.data.location.name as string).toLowerCase().includes('brugge')) {
                outOfBruges = true;
            }

            // If we are in bruges again, we have problem
            if (outOfBruges && e.data.location) {
                assert.ok((e.data.location.name as string).toLowerCase().includes('brugge') === false);
            }
        });
    });

    it('replace node cannot have null eventdate ', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/36117_null_event_date.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);

        // then
        assert.ok(cy.edges().length > 0);
    });

    it('replace node cannot be in different transport_unit id', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/36117_null_event_date.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);

        // then
        assert.ok(cy.edges().length > 0);
    });

    it('connect null event nodes to the existing trade_flow', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/38056_null_event.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);
        EventAtLocationNode.all(cy)
            .filter((e) => e.streamNodes('upstream').length === 0)
            .filter((e) => e.data.type === EventAtLocationNode.TYPE)
            .forEach((e) => {
                // this means we're looking at a new TP for a specific TU
                const transportUnits = e.streamNodes('downstream');
                assert.ok(transportUnits);
                if (transportUnits) {
                    assert.ok(transportUnits?.length === 3);
                    const order = EventAtLocationNode.naturalOrder;
                    assert.equal(transportUnits[0].data.status_code.status_code, order[1]);
                    assert.equal(transportUnits[1].data.status_code.status_code, order[2]);
                    assert.equal(transportUnits[2].data.status_code.status_code, order[4]);
                }
            });
    });

    it('should connect the nodes, even in cases where event_date is null', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/36748_null_events.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);
        assert.isAtLeast(
            EventAtLocationNode.all(cy)
                .filter((e) => e.streamNodes('upstream').length === 0)
                .sort((a, b) => {
                    const aCount = a.streamNodes('downstream').length;
                    const bCount = b.streamNodes('downstream').length;

                    return bCount - aCount;
                })
                .shift()
                ?.streamNodes('downstream').length ?? 0,
            10,
        );
    });
    it('should not skip intermediate locations', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/test_ss_17.txt').toString());

        // when
        const cy = await new StoryBuildingCore().execute(execContext);
        assert.isAtLeast(
            EventAtLocationNode.all(cy)
                .filter((e) => e.streamNodes('upstream').length === 0)
                .sort((a, b) => {
                    const aCount = a.streamNodes('downstream').length;
                    const bCount = b.streamNodes('downstream').length;

                    return bCount - aCount;
                })
                .shift()
                ?.streamNodes('downstream')
                .filter((e) => e.data.location && (e.data.location.name as string).toLowerCase().includes('singapore'))
                .length ?? 0,
            1,
        );
    });
});
