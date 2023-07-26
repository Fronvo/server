// ******************** //
// The fetchPROCH account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FetchPROCHResult,
    FetchPROCHServerParams,
} from 'interfaces/account/fetchPROCH';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function fetchPROCH({
    socket,
    secret,
}: FetchPROCHServerParams): Promise<FetchPROCHResult | FronvoError> {
    if (secret != getEnv('PRO_SECRET')) {
        return generateError('UNKNOWN');
    }

    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        select: {
            isPRO: true,
            proCH: true,
        },
    });

    if (!account.isPRO || !account.proCH) {
        return generateError('UNKNOWN');
    }

    return { proCH: account.proCH };
}

const fetchPROCHTemplate: EventTemplate = {
    func: fetchPROCH,
    template: ['secret'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },
    }),
};

export default fetchPROCHTemplate;
