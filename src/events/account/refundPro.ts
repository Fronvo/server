// ******************** //
// The refundPro account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    RefundProResult,
    RefundProServerParams,
} from 'interfaces/account/refundPro';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function refundPro({
    socket,
    secret,
}: RefundProServerParams): Promise<RefundProResult | FronvoError> {
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

    await prismaClient.account.update({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        data: {
            isPRO: false,
            proCH: '',
        },
    });

    return {};
}

const refundProTemplate: EventTemplate = {
    func: refundPro,
    template: ['secret'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },
    }),
};

export default refundProTemplate;
