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
});
