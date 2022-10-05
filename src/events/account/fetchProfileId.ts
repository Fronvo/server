// ******************** //
// The fetchProfileId account-only event file.
// ******************** //

import {
    FetchProfileIdResult,
    FetchProfileIdServerParams,
} from 'interfaces/account/fetchProfileId';
import { EventTemplate } from 'interfaces/all';
import { getSocketAccountId } from 'utilities/global';

function fetchProfileId({
    socket,
}: FetchProfileIdServerParams): FetchProfileIdResult {
    return {
        profileId: getSocketAccountId(socket.id),
    };
}

const fetchProfileIdTemplate: EventTemplate = {
    func: fetchProfileId,
    template: [],
};

export default fetchProfileIdTemplate;
