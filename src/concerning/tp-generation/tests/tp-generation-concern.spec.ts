import { assert } from 'chai';
import fs from 'fs';
import { Orchestrator } from '../../../orchestrator/orchestrator';
import { ExecutionContext } from '../../../types/execution-context';
import { StoryBuildingCore } from '../../../story-building/story-building-core';
import { TPGeneration } from '../tp-generation-concern';
import { UOTMTransportPlanSegment } from '../../../types/uotm-transportplan-segment';

describe('Transport Plan concern ', () => {
    it('Orchestrator executes with calling transport plan generation methods', () => {
        new Orchestrator()
            .execute(JSON.parse(fs.readFileSync(__dirname + '/test-files/37071_simple_tp_plan.txt').toString()))
            .then((res) => {
                assert.ok(res.tradeflow_id === 37071);
                assert.ok(res.segments[1].type === 'TransportPlan');
                assert.ok(res.segments.length === 2);
            });
    });

    it('transport plan concern instance without params', () => {
        const changedETAConcern = new TPGeneration();
        assert.ok(changedETAConcern);
    });

    it('transport plan instance with params', async () => {
        // given
        const execContext: ExecutionContext = {
            ...JSON.parse(fs.readFileSync(__dirname + '/test-files/37071_simple_tp_plan.txt').toString()),
            config: {},
            tradeflow_id: 37071,
        };
        //when
        const cy = await new StoryBuildingCore().execute(execContext);
        const segments = TPGeneration.getSegments(cy);

        //then
        assert.ok(segments);
    });

    it('simple transport plan get in & out of locations', async () => {
        // given
        const execContext = JSON.parse(fs.readFileSync(__dirname + '/test-files/37071_simple_tp_plan.txt').toString());
        const cy = await new StoryBuildingCore().execute(execContext);

        //when
        const segments: UOTMTransportPlanSegment[] = TPGeneration.getSegments(cy);

        //then
        assert.ok(segments.length === 1);
        segments.forEach((node) => {
            assert.ok(node.type === 'TransportPlan');
            assert.ok(node.shipments.length == 1);
            assert.ok(node.shipments[0].containers.length == 1);
            assert.ok(node.shipments[0].transport_plan_legs.length == 1);
            assert.ok(node.shipments[0].transport_plan_legs[0].sea_shipment_legs.length === 1);
        });
    });

    it('mulitple transport plan get in & out of locations', async () => {
        // given
        const execContext = JSON.parse(
            fs.readFileSync(__dirname + '/test-files/36623_multiple_tp_plan.txt').toString(),
        );
        const cy = await new StoryBuildingCore().execute(execContext);

        //when
        const segments: UOTMTransportPlanSegment[] = TPGeneration.getSegments(cy);

        //then
        assert.ok(segments.length === 1);
        segments.forEach((node) => {
            assert.ok(node.type === 'TransportPlan');
            assert.ok(node.shipments.length == 2);

            // tp 1
            assert.ok(node.shipments[0].containers.length == 3);
            assert.ok(node.shipments[0].transport_plan_legs.length == 1);
            assert.ok(node.shipments[0].transport_plan_legs[0].sea_shipment_legs.length === 2);

            // tp 2
            assert.ok(node.shipments[1].containers.length == 1);
            assert.ok(node.shipments[1].transport_plan_legs.length == 1);
            assert.ok(node.shipments[1].transport_plan_legs[0].sea_shipment_legs.length === 2);
        });
    });
});
