// ******************** //
// Interfaces for the fetchRoomMessages event file.
// ******************** //

import { Account, RoomMessage } from '@prisma/client';
import { EventArguments, FronvoError } from 'interfaces/all';

export interface FetchRoomMessagesParams {
    from: string;
    to: string;
}

export interface FetchRoomMessagesServerParams
    extends EventArguments,
        FetchRoomMessagesParams {}

export interface FetchRoomMessagesResult {
    roomMessages: {
        message: Partial<RoomMessage>;
        profileData: Partial<Account>;
    }[];
}

export interface FetchRoomMessagesTestResult
    extends FronvoError,
        FetchRoomMessagesResult {}
