// ******************** //
// Interfaces for the updateProfileData event file.
// ******************** //

import { EventArguments, FronvoError } from 'interfaces/all';

export interface UpdateRoomDataParams {
    roomId: string;
    name?: string;
    description?: string;
    icon?: string;
}

export interface UpdateRoomDataServerParams
    extends EventArguments,
        UpdateRoomDataParams {}

export interface UpdateRoomDataResult {}

export interface UpdateRoomDataTestResult
    extends FronvoError,
        UpdateRoomDataResult {}
