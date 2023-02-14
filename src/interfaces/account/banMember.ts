// ******************** //
// Interfaces for the banMember event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface BanMemberParams {
    profileId: string;
}

export interface BanMemberServerParams
    extends EventArguments,
        BanMemberParams {}

export interface BanMemberResult {}

export interface BanMemberTestResult extends FronvoError, BanMemberResult {}
