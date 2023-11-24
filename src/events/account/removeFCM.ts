// ******************** //
// The removeFCM account event file.
// ******************** //

import {
    RemoveFCMResult,
    RemoveFCMServerParams,
} from 'interfaces/account/removeFCM';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function removeFCM({
    account,
}: RemoveFCMServerParams): Promise<RemoveFCMResult | FronvoError> {
    if (!account.fcm) {
        return generateError('UNKNOWN');
    }

    await prismaClient.account.update({
        where: {
            profileId: account.profileId,
        },

        data: {
            fcm: '',
        },
    });

    return {};
}

const removeFCMTemplate: EventTemplate = {
    func: removeFCM,
    template: [],
};

export default removeFCMTemplate;
