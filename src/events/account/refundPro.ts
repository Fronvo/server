// ******************** //
// The refundPro account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    RefundProResult,
    RefundProServerParams,
} from 'interfaces/account/refundPro';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function refundPro({
    account,
    secret,
}: RefundProServerParams): Promise<RefundProResult | FronvoError> {
    if (secret != getEnv('PRO_SECRET')) {
        return generateError('UNKNOWN');
    }

    if (!account.isPRO || !account.proCH) {
        return generateError('UNKNOWN');
    }

    await prismaClient.account.update({
        where: {
            profileId: account.profileId,
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
    fetchAccount: true,
};

export default refundProTemplate;
