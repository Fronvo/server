// ******************** //
// Interfaces for the unbanMember event file.
// ******************** //

import { FronvoError, EventArguments } from 'interfaces/all';

export interface UnbanMemberParams {
    profileId: string;
}

export interface UnbanMemberServerParams
    extends EventArguments,
        UnbanMemberParams {}

export interface UnbanMemberResult {}

export interface UnbanMemberTestResult extends FronvoError, UnbanMemberResult {}
