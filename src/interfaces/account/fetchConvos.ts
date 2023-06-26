// ******************** //
// Interfaces for the fetchConvos event file.
// ******************** //

import { Room } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';
import { FetchedFronvoAccount } from './fetchProfileData';

export interface FetchConvosParams {}

export interface FetchConvosServerParams
    extends EventArguments,
        FetchConvosParams {}

export interface FetchConvosResult {
    convos: Partial<Room>[];
}

export interface FetchedRoom extends Room {
    unreadCount: number;
}

export interface FetchedDM extends FetchedRoom {
    dmUserOnline: boolean;
    dmUser: FetchedFronvoAccount;
}

export interface FetchConvosTestResult extends FronvoError, FetchConvosResult {}
