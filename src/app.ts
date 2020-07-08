import { GraphyServer } from './core/server';
import { DisplayCore } from './display/display-core';
import { InfluxCore } from './influx/influx-core';
import { Orchestrator } from './orchestrator/orchestrator';
import * as fs from 'fs';

const graphyServer = new GraphyServer();

graphyServer.register(DisplayCore);

graphyServer.register(InfluxCore);

new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_1.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_2.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_3.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_4.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_5.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_6.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_7.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_8.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_9.txt').toString()));
new Orchestrator().execute(JSON.parse(fs.readFileSync('assets/test_files/test_ss_10.txt').toString()));
