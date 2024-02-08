// ******************** //
// Interfaces for the serverJoined event file.
// ******************** //

import { Server } from '@prisma/client';

export interface ServerJoinedParams {
    server: Partial<Server>;
}
