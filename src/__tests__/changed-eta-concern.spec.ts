import { assert } from 'chai';
import fs from 'fs';
import { Orchestrator } from '../orchestrator/orchestrator';
import { ChangedETAConcern } from '../concerning/changed-eta-concern';

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
        assert.ok(true);
    });

    it('changed eta instance with params', () => {
        const changedETAConcern = new ChangedETAConcern();
    });
    it('changed eta concern get first event of last location', () => {});
});
