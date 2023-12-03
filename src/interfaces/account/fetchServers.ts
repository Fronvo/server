// ******************** //
// Interfaces for the fetchServers event file.
// ******************** //

import { Server } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface FetchServersParams {}

export interface FetchServersServerParams
    extends EventArguments,
        FetchServersParams {}

export interface FetchServersResult {
    servers: Partial<Server>[];
}

export interface FetchServersTestResult
    extends FronvoError,
        FetchServersResult {}
