// ******************** //
// Interfaces for the dmCreated event file.
// ******************** //

import { FetchedDM } from './fetchConvos';

export interface DmCreatedParams {
    dm: Partial<FetchedDM>;
}
