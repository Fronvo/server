// ******************** //
// Interfaces for the fetchConvos event file.
// ******************** //

import { Dm } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';
import { FetchedFronvoAccount } from './fetchProfileData';

export interface FetchConvosParams {}

export interface FetchConvosServerParams
    extends EventArguments,
        FetchConvosParams {}

export interface FetchConvosResult {
    convos: Partial<Dm>[];
}

export interface FetchedDM extends Dm {
    unreadCount: number;
    totalMessages: number;
    dmUser: Partial<FetchedFronvoAccount>;
}

export interface FetchConvosTestResult extends FronvoError, FetchConvosResult {}
