// ******************** //
// The fetchProfileId account-only event file.
// ******************** //

import { FetchProfileIdResult, FetchProfileIdServerParams } from 'interfaces/account/fetchProfileId';
import { getLoggedInSockets } from 'utilities/global';

export default ({ socket }: FetchProfileIdServerParams): FetchProfileIdResult => {
    return {profileId: getLoggedInSockets()[socket.id].accountId};
}
