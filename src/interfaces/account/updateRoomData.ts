// ******************** //
// Interfaces for the updateProfileData event file.
// ******************** //

import { Room } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface UpdateRoomDataParams {
    roomId?: string;
    name?: string;
    description?: string;
    icon?: string;
}

export interface UpdateRoomDataServerParams
    extends EventArguments,
        UpdateRoomDataParams {}

export interface UpdateRoomDataResult {
    roomData: Partial<Room>;
}

export interface UpdateRoomDataTestResult
    extends FronvoError,
        UpdateRoomDataResult {}
