// ******************** //
// The applyTheme account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    ApplyThemeResult,
    ApplyThemeServerParams,
} from 'interfaces/account/applyTheme';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function applyTheme({
    account,
    title,
}: ApplyThemeServerParams): Promise<ApplyThemeResult | FronvoError> {
    if (!account.isPRO) {
        return generateError('PRO_REQUIRED');
    }

    const theme = await prismaClient.theme.findFirst({
        where: {
            title,
        },
    });

    if (!theme) {
        return generateError('THEME_404');
    }

    await prismaClient.account.update({
        where: {
            profileId: account.profileId,
        },

        data: {
            appliedTheme: title,
        },
    });

    return {};
}

const applyThemeTemplate: EventTemplate = {
    func: applyTheme,
    template: ['title'],
    schema: new StringSchema({
        title: {
            minLength: 2,
            maxLength: 20,
            regex: /[a-zA-Z0-9]/,
        },
    }),
    fetchAccount: true,
};

export default applyThemeTemplate;
