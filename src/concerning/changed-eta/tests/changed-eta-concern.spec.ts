import { assert } from 'chai';
import fs from 'fs';

import { Orchestrator } from '../../../orchestrator/orchestrator';
import { EventAtLocationNode } from '../../../story-building/nodes/event-at-location-node';
import { StoryBuildingCore } from '../../../story-building/story-building-core';
import { TransportUnit } from '../../../types/docky-shipment-status-types';
import { ExecutionContext } from '../../../types/execution-context';
import { ChangedETAConcern } from '../changed-eta-concern';

describe('ETA changed concern ', () => {
    //get test files
    it('Orchestrator executes with calling eta changed methods', async () => {
        return new Orchestrator()
            .execute(JSON.parse(fs.readFileSync(__dirname + '/test-files/test_ss_4.txt').toString()))
            .then((res) => {
                assert.ok(res.tradeflow_id === '32080');
                assert.ok(res.segments.find((e) => e.type === 'ChangedETA'));
            });
    });

    it('changed eta concern instance without params', () => {
        const changedETAConcern = new ChangedETAConcern();
        assert.ok(changedETAConcern);
    });

    it('changed eta instance with params', async () => {
        const execContext: ExecutionContext = {
            ...JSON.parse(fs.readFileSync(__dirname + '/test-files/test_ss_4.txt').toString()),
            config: {},
            tradeflow_id: 32080,
        };
        const cy = await new StoryBuildingCore().execute(execContext);
        const segments = ChangedETAConcern.getSegments(cy, execContext);
        assert.ok(segments);
    });

    it('changed eta get first event of last location', async () => {
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/test_ss_4.txt').toString());
        const cy = await new StoryBuildingCore().execute(execContext);

        const transportUnits = EventAtLocationNode.all(cy).reduce((carry, item) => {
            if (carry.findIndex((e) => item.data.transport_unit && e.id === item.data.transport_unit.id) === -1) {
                carry.push(item.data.transport_unit);
            }
            return carry;
        }, [] as TransportUnit[]);

        assert.ok(transportUnits.length === 1);

        const lastLocationEvent: EventAtLocationNode | null = ChangedETAConcern.getVesselArrivalEvent(
            transportUnits[0],
            cy,
        );

        assert.strictEqual(lastLocationEvent?.data.name, 'vessel arrival');
        assert.strictEqual(lastLocationEvent?.data.status_code.id, 156);
    });

    it('changed eta get tu alerts ', async () => {
        const ss1 = JSON.parse(fs.readFileSync(__dirname + '/test-files/test_ss_4.txt').toString());
        const ss2 = JSON.parse(fs.readFileSync(__dirname + '/test-files/test_ss_12.txt').toString());

        const cy1 = await new StoryBuildingCore().execute(ss1);
        const cy2 = await new StoryBuildingCore().execute(ss2);

        const uomtmessages1 = ChangedETAConcern.getSegments(cy1, {
            shipment_statuses: ss1.shipment_statuses,
            config: {},
            tradeflow_id: ss1.shipment_statuses[0].tradeflow_id,
        });
        const uomtmessages2 = ChangedETAConcern.getSegments(cy2, {
            shipment_statuses: ss2.shipment_statuses,
            config: {},
            tradeflow_id: ss2.shipment_statuses[0].tradeflow_id,
        });

        assert.strictEqual(uomtmessages1.pop()?.log.length ?? 0, 3);
        assert.strictEqual(uomtmessages2.pop()?.log.length ?? 0, 1);
    });
});
