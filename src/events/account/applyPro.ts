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

    if (account.turbo) {
        return generateError('UNKNOWN');
    }

    await prismaClient.account.update({
        where: {
            profileId: account.profileId,
        },

        data: {
            turbo: true,
            turboCH: encryptAES(proCH),
        },
    });

    sendEmail(account.email, 'Welcome to the TURBO club', [
        'We hope you enjoy the added benefits of the PROs, featuring:',
        '- High-quality images',
        '- Larger file uploads',
        '- A personalised banner',
    ]);

    return {};
}

const applyProTemplate: EventTemplate = {
    func: applyPro,
    template: ['secret', 'turboCh'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },

        turboCh: {
            regex: /^[a-zA-Z0-9_]+/,
        },
    }),
};

export default applyProTemplate;
