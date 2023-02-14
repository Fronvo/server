// ******************** //
// Interfaces for the kickMember event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface KickMemberParams {
    profileId: string;
}

export interface KickMemberServerParams
    extends EventArguments,
        KickMemberParams {}

export interface KickMemberResult {}

export interface KickMemberTestResult extends FronvoError, KickMemberResult {}
