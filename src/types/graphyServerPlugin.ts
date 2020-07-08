import { GraphyServer } from '../core/server';

export interface GraphyServerPlugin {
    run(server: GraphyServer): void;
}
