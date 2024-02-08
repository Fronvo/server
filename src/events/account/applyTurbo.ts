// ******************** //
// The applyTurbo account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    ApplyTurboResult,
    ApplyTurboServerParams,
} from 'interfaces/account/applyTurbo';

import { EventTemplate, FronvoError } from 'interfaces/all';
import { encryptAES, generateError, sendEmail } from 'utilities/global';
import { prismaClient } from 'variables/global';
import { getEnv } from 'variables/varUtils';

async function applyTurbo({
    account,
    secret,
    turboCH,
}: ApplyTurboServerParams): Promise<ApplyTurboResult | FronvoError> {
    if (secret != getEnv('TURBO_SECRET')) {
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
            turboCH: encryptAES(turboCH),
        },
    });

    sendEmail(account.email, 'Welcome to the TURBO club', [
        'We hope you enjoy the added benefits of the club, featuring:',
        '- High-quality images',
        '- Larger file uploads',
        '- Higher server creation limits',
        '- Higher friend limits',
    ]);

    return {};
}

const applyProTemplate: EventTemplate = {
    func: applyTurbo,
    template: ['secret', 'turboCH'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },

        turboCH: {
            regex: /^[a-zA-Z0-9_]+/,
        },
    }),
};

export default applyProTemplate;
