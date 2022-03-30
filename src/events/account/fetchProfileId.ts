// ******************** //
// The fetchProfileId account-only event file.
// ******************** //

import { FetchProfileIdResult, FetchProfileIdServerParams } from 'interfaces/account/fetchProfileId';
import { EventTemplate } from 'interfaces/all';
import { getLoggedInSockets } from 'utilities/global';

function fetchProfileId({ socket }: FetchProfileIdServerParams): FetchProfileIdResult {
    return {profileId: getLoggedInSockets()[socket.id].accountId};
}

const fetchProfileIdTemplate: EventTemplate = {
    func: fetchProfileId,
    template: [],
    points: 1
};

export default fetchProfileIdTemplate;
