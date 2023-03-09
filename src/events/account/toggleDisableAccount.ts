// ******************** //
// The toggleDisableAccount account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    ToggleDisableAccountResult,
    ToggleDisableAccountServerParams,
} from 'interfaces/account/toggleDisableAccount';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId, sendEmail } from 'utilities/global';
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

    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_DOESNT_EXIST');
    }

    if (targetAccount.profileId == account.profileId) {
        return generateError('DISABLE_SELF');
    }

    if (targetAccount.isAdmin) {
        return generateError('DISABLE_ADMIN');
    }

    const disabledState = await prismaClient.account.update({
        where: {
            profileId,
        },

        data: {
            isDisabled: !targetAccount.isDisabled,
        },

        select: {
            isDisabled: true,
        },
    });

    if (disabledState.isDisabled) {
        sendEmail(targetAccount.email, `Account Disabled`, [
            'We have decided to disable your account.',
            'You will be unable to create posts but will still be able to message in communities.',
        ]);
    }

    return {};
}

const toggleDisableAccountTemplate: EventTemplate = {
    func: toggleDisableAccount,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default toggleDisableAccountTemplate;
