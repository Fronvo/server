// ******************** //
// Interfaces for the fetchRoomData event file.
// ******************** //

import { Room } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchRoomDataParams {
    roomId: string;
}

export interface FetchRoomDataServerParams
    extends EventArguments,
        FetchRoomDataParams {}

export interface FetchedFronvoRoom extends Partial<Room> {
    totalMessages: number;
}

export interface FetchRoomDataResult {
    roomData: FetchedFronvoRoom;
}

export interface FetchRoomDataTestResult
    extends FronvoError,
        FetchRoomDataResult {}
