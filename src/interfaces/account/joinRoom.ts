// ******************** //
// Interfaces for the joinRoom event file.
// ******************** //

import { Room } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface JoinRoomParams {
    roomId: string;
}

export interface JoinRoomServerParams extends EventArguments, JoinRoomParams {}

export interface JoinRoomResult {
    roomData: Partial<Room>;
}

export interface JoinRoomTestResult extends FronvoError, JoinRoomResult {}
