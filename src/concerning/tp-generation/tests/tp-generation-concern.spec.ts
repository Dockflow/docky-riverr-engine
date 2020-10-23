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

    /*
    In this scenario we have two containers with two seperate transport jouerney.
    One container (HLBU1279342 ) starting from  GB Oldburyand  and going to IN Mundra
    Other ctonaer ( BMOU3142525) starting from  GB Oldburyand  and going to US Oakland
    So both Cotainers Starting from same location but we have only one Location Node which has move type as 'OUT'.
    */
    it('mulitple transport plan get in & out of locations with multiple destinations', async () => {
        // given
        const execContext = JSON.parse(
            fs.readFileSync(__dirname + '/test-files/36643_multiple _tp_multiple_destinations.txt').toString(),
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
            assert.ok(node.shipments[0].containers.length == 1);
            assert.ok(node.shipments[0].containers[0].reference == 'HLBU1279342');
            assert.ok(node.shipments[0].transport_plan_legs.length == 1);
            assert.ok(node.shipments[0].transport_plan_legs[0].sea_shipment_legs.length === 2);

            // tp 2
            assert.ok(node.shipments[1].containers.length == 1);
            assert.ok(node.shipments[1].containers[0].reference == 'BMOU3142525');
            assert.ok(node.shipments[1].transport_plan_legs.length == 1);
            assert.ok(node.shipments[1].transport_plan_legs[0].sea_shipment_legs.length === 3);
        });
    });

    /*
    In this scenario we have three containers with two transport jouerney.
    Other ctonaer ( TEMU4846097) starting from  BR  and going to BE
    Two containers (TLLU2559118, FCIU6574990 ) starting from  BR and going to NL and use BE as a transhipment location.
    So both Cotainers Starting from same location but we have only one Location Node which has move type as 'OUT'.
    */
    it('mulitple transport plan get in & out of locations with extend destinations', async () => {
        // given
        const execContext = JSON.parse(
            fs.readFileSync(__dirname + '/test-files/12345_muliple_tp_extened_destinations.txt').toString(),
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
            assert.ok(node.shipments[0].containers.length == 2);
            assert.ok(node.shipments[0].containers[1].reference == 'TLLU2559118');
            assert.ok(node.shipments[0].containers[0].reference == 'FCIU6574990');
            assert.ok(node.shipments[0].transport_plan_legs.length == 1);
            assert.ok(node.shipments[0].transport_plan_legs[0].sea_shipment_legs.length === 2);

            // tp 2
            assert.ok(node.shipments[1].containers.length == 1);
            assert.ok(node.shipments[1].containers[0].reference == 'TEMU4846097');
            assert.ok(node.shipments[1].transport_plan_legs.length == 1);
            assert.ok(node.shipments[1].transport_plan_legs[0].sea_shipment_legs.length === 1);
        });
    });

    /*
    In this scenario we have 11 containers with one transport jouerney.
    All should go VN --> VN --> NL --> NL
    Here We use one carrier to transport containers from VN --> VN and VN--> VL
    Another another carrier to transport containers from NL --> NL
    Which means two tp legs and one with 2 sea legs and another one with 1 sea leg.
    */
    it('single transport plan with mutiple sea shipments', async () => {
        // given
        const execContext = JSON.parse(
            fs.readFileSync(__dirname + '/test-files/41960_single_tp_multiple_seaShipments.txt').toString(),
        );
        const cy = await new StoryBuildingCore().execute(execContext);

        //when
        const segments: UOTMTransportPlanSegment[] = TPGeneration.getSegments(cy);
        //then
        assert.ok(segments.length === 1);
        segments.forEach((node) => {
            assert.ok(node.type === 'TransportPlan');
            assert.ok(node.shipments.length == 1);

            assert.ok(node.shipments[0].containers.length == 11);
            assert.ok(node.shipments[0].transport_plan_legs.length == 2);
            assert.ok(node.shipments[0].transport_plan_legs[0].sea_shipment_legs.length === 2);
            assert.ok(node.shipments[0].transport_plan_legs[1].sea_shipment_legs.length === 1);
        });
    }).timeout(30000);
});
