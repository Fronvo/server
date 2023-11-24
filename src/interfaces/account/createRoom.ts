// ******************** //
// Interfaces for the createRoom event file.
// ******************** //

import { Room } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface CreateRoomParams {
    name: string;
    icon?: string;
}

export interface CreateRoomServerParams
    extends EventArguments,
        CreateRoomParams {}

export interface CreateRoomResult {
    roomData: Partial<Room>;
}

export interface CreateRoomTestResult extends FronvoError, CreateRoomResult {}
