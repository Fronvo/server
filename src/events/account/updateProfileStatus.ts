// ******************** //
// The updateProfileStatus account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateProfileStatusResult,
    UpdateProfileStatusServerParams,
} from 'interfaces/account/updateProfileStatus';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function updateProfileStatus({
    socket,
    status,
}: UpdateProfileStatusServerParams): Promise<
    UpdateProfileStatusResult | FronvoError
> {
    await prismaClient.account.update({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        data: {
            status,
            statusUpdatedTime: new Date(),
        },
    });

    return {};
}

const updateProfileStatusTemplate: EventTemplate = {
    func: updateProfileStatus,
    template: ['status'],
    schema: new StringSchema({
        status: {
            maxLength: 20,
        },
    }),
};

export default updateProfileStatusTemplate;
