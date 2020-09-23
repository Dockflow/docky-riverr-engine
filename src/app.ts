import { GraphyServer } from './core/server';
import { DisplayCore } from './display/display-core';
import { InfluxCore } from './influx/influx-core';
import { Orchestrator } from './orchestrator/orchestrator';
import * as fs from 'fs';
import { config } from './config';

const graphyServer = new GraphyServer();

graphyServer.register(DisplayCore);

graphyServer.register(InfluxCore);

if (config.server.env === 'test') {
    [...Array(21).keys()].map(async (key) => {
        if (key === 0) {
            return true;
        }
        new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test-files/test_ss_' + key + '.txt').toString()));
    });
}
