import { Orchestrator } from './orchestrator/orchestrator';
import * as fs from 'fs';

(async (): Promise<void> => {
    new Orchestrator().execute({
        ...JSON.parse(fs.readFileSync('test_ss.txt').toString()),
        config: {},
    });
})();
