import { Orchestrator } from './orchestrator/orchestrator';
import * as fs from 'fs';

(async (): Promise<void> => {
    new Orchestrator().execute({
        shipment_statuses: JSON.parse(fs.readFileSync('test_ss.txt').toString()),
    });
})();
