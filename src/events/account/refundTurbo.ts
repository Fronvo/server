// ******************** //
// The refundPro account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    RefundTurboResult,
    RefundTurboServerParams,
} from 'interfaces/account/refundTurbo';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, sendEmail } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function refundTurbo({
    account,
    secret,
}: RefundTurboServerParams): Promise<RefundTurboResult | FronvoError> {
    if (secret != getEnv('TURBO_SECRET')) {
        return generateError('UNKNOWN');
    }

    if (!account.turbo || !account.turboCH) {
        return generateError('UNKNOWN');
    }

    try {
        await prismaClient.account.update({
            where: {
                profileId: account.profileId,
            },

            data: {
                turbo: false,
                turboCH: '',
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    sendEmail(account.email, 'You left the TURBO club', [
        'It was a fun time having you with the other TURBOs.',
        'We wish you a good time on Fronvo.',
    ]);

    return {};
}

const refundProTemplate: EventTemplate = {
    func: refundTurbo,
    template: ['secret'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },
    }),
};

export default refundProTemplate;
