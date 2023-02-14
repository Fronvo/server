// ******************** //
// Interfaces for the showBannedMembers event file.
// ******************** //

import { Account } from '@prisma/client';
import { FronvoError, EventArguments } from 'interfaces/all';

export interface ShowBannedMembersParams {}

export interface ShowBannedMembersServerParams
    extends EventArguments,
        ShowBannedMembersParams {}

export interface ShowBannedMembersResult {
    bannedMembers: Partial<Account>[];
}

export interface ShowBannedMembersTestResult
    extends FronvoError,
        ShowBannedMembersResult {}
