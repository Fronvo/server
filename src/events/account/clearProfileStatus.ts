// ******************** //
// The clearProfileStatus account event file.
// ******************** //

import {
    ClearProfileStatusResult,
    ClearProfileStatusServerParams,
} from 'interfaces/account/clearProfileStatus';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function clearProfileStatus({
    socket,
}: ClearProfileStatusServerParams): Promise<
    ClearProfileStatusResult | FronvoError
> {
    await prismaClient.account.update({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        data: {
            status: '',
        },
    });

    return {};
}

const clearProfileStatusTemplate: EventTemplate = {
    func: clearProfileStatus,
    template: [],
};

export default clearProfileStatusTemplate;
