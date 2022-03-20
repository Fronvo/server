// ******************** //
// The fetchProfileId account-only event file.
// ******************** //

import { EventArguments } from 'other/interfaces';
import { getLoggedInSockets } from 'other/utilities';
import { FetchProfileIdResult } from './interfaces';

export default function fetchProfileId({ socket }: EventArguments): FetchProfileIdResult {
    return {profileId: getLoggedInSockets()[socket.id].accountId};
}
