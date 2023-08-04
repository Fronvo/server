// ******************** //
// The applyPro account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    ApplyProResult,
    ApplyProServerParams,
} from 'interfaces/account/applyPro';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { encryptAES, generateError, sendEmail } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function applyPro({
    account,
    secret,
    proCH,
}: ApplyProServerParams): Promise<ApplyProResult | FronvoError> {
    if (secret != getEnv('PRO_SECRET')) {
        return generateError('UNKNOWN');
    }

    if (account.isPRO) {
        return generateError('UNKNOWN');
    }

    await prismaClient.account.update({
        where: {
            profileId: account.profileId,
        },

        data: {
            isPRO: true,
            proCH: encryptAES(proCH),
        },
    });

    sendEmail(account.email, 'Welcome to the PRO club', [
        'We hope you enjoy the added benefits of the PROs, featuring:',
        '- High-quality images',
        '- Larger file uploads',
        '- A personalised banner',
        '- The Theme Marketplace',
        '- No post cooldown',
        '- Up to 100 friends',
        '- Up to 20 rooms',
        '- Exclusive PRO palette',
    ]);

    return {};
}

const applyProTemplate: EventTemplate = {
    func: applyPro,
    template: ['secret', 'proCH'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },

        proCH: {
            regex: /^[a-zA-Z0-9_]+/,
        },
    }),
};

export default applyProTemplate;
