import { GraphyServer } from './core/server';
import { DisplayCore } from './display/display-core';

const graphyServer = new GraphyServer();

graphyServer.register(DisplayCore);
