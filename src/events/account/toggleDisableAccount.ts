// ******************** //
// The toggleDisableAccount account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    ToggleDisableAccountResult,
    ToggleDisableAccountServerParams,
} from 'interfaces/account/toggleDisableAccount';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function toggleDisableAccount({
    socket,
    profileId,
}: ToggleDisableAccountServerParams): Promise<
    ToggleDisableAccountResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    const isAdmin = account.isAdmin || account.profileId == 'fronvo';

    if (!isAdmin) {
        return generateError('NOT_ADMIN');
    }

    const previousState = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!account) {
        return generateError('ACCOUNT_DOESNT_EXIST');
    }

    await prismaClient.account.update({
        where: {
            profileId,
        },

        data: {
            isDisabled: !previousState.isDisabled,
        },
    });

    return {};
}

const toggleDisableAccountTemplate: EventTemplate = {
    func: toggleDisableAccount,
    template: ['profileId'],
    schema: new StringSchema({
        profileId: {
            minLength: 5,
            maxLength: 30,
            regex: /^[a-z0-9.]+$/,
        },
    }),
};

export default toggleDisableAccountTemplate;
