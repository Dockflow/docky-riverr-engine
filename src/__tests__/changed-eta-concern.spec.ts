import { assert } from 'chai';
import fs from 'fs';
import { Orchestrator } from '../orchestrator/orchestrator';
import { ChangedETAConcern } from '../concerning/changed-eta-concern';
import { StoryBuildingCore } from '../story-building/story-building-core';
import { EventAtLocationNode } from '../story-building/nodes/event-at-location-node';
import { TransportUnit } from '../types/docky-shipment-status-types';

describe('ETA changed concern ', () => {
    //get test files
    it('Orchestrator executes with calling eta changed methods', () => {
        new Orchestrator()
            .execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_4.txt').toString()))
            .then((res) => {
                assert.ok(res.tradeflow_id === '32080');
                assert.ok(res.segments[0].type === 'ContainerMilestones');
                assert.ok(res.segments.length === 1);
            });
    });

    it('changed eta concern instance without params', () => {
        const changedETAConcern = new ChangedETAConcern();
        assert.ok(changedETAConcern);
    });

    it('changed eta instance with params', async () => {
        const execContext = JSON.parse(fs.readFileSync('assets/test_files/test_ss_4.txt').toString());
        const cy = await new StoryBuildingCore().execute(execContext);
        const segments = ChangedETAConcern.getSegments(cy, execContext);
        assert.ok(segments);
    });

    it('changed eta get first event of last location', async () => {
        const execContext = JSON.parse(fs.readFileSync('assets/test_files/test_ss_4.txt').toString());
        const cy = await new StoryBuildingCore().execute(execContext);

        const transportUnits = EventAtLocationNode.all(cy).reduce((carry, item) => {
            if (carry.findIndex((e) => item.data.transport_unit && e.id === item.data.transport_unit.id) === -1) {
                carry.push(item.data.transport_unit);
            }
            return carry;
        }, [] as TransportUnit[]);

        assert.ok(transportUnits.length === 1);

        const lastLocationEvent: EventAtLocationNode | null = ChangedETAConcern.firstEventLastLocation(
            transportUnits[0],
            cy,
        );

        assert.ok(lastLocationEvent?.data.name === 'discharg');
        assert.ok(lastLocationEvent?.data.message === 'discharg');
        assert.ok(lastLocationEvent?.data.status_code.id === 6130);
    });

    it('changed eta get tu alerts ', async () => {
        const ss1 = JSON.parse(fs.readFileSync('assets/test_files/test_ss_4.txt').toString());
        const ss2 = JSON.parse(fs.readFileSync('assets/test_files/test_ss_12.txt').toString());

        const cy1 = await new StoryBuildingCore().execute(ss1);
        const cy2 = await new StoryBuildingCore().execute(ss2);

        const uomtmessages1 = ChangedETAConcern.getSegments(cy1, {
            shipment_statuses: ss1.shipment_statuses,
            config: { eta_delay_in_hours: 24, eta_changed_limit: 3 },
            tradeflow_id: ss1.shipment_statuses[0].tradeflow_id,
        });
        const uomtmessages2 = ChangedETAConcern.getSegments(cy2, {
            shipment_statuses: ss2.shipment_statuses,
            config: { eta_delay_in_hours: 24, eta_changed_limit: 3 },
            tradeflow_id: ss2.shipment_statuses[0].tradeflow_id,
        });
        const uomtmessages3 = ChangedETAConcern.getSegments(cy2, {
            shipment_statuses: ss2.shipment_statuses,
            config: { eta_delay_in_hours: 1000, eta_changed_limit: 3 },
            tradeflow_id: ss2.shipment_statuses[0].tradeflow_id,
        });

        assert.ok(uomtmessages1.length === 0);
        assert.ok(uomtmessages2.length === 1);
        assert.ok(uomtmessages3.length === 0);
    });
});
