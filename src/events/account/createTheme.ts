// ******************** //
// The createTheme account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    CreateThemeResult,
    CreateThemeServerParams,
} from 'interfaces/account/createTheme';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function createTheme({
    account,
    title,
    brandingWhite,
    brandingDarkenWhite,
    brandingDark,
    brandingDarkenDark,
}: CreateThemeServerParams): Promise<CreateThemeResult | FronvoError> {
    // Owner-only
    if (account.profileId != 'fronvo') {
        return generateError('NOT_FRONVO');
    }

    await prismaClient.theme.create({
        data: {
            title,
            brandingWhite,
            brandingDarkenWhite,
            brandingDark,
            brandingDarkenDark,
        },
    });

    return {};
}

const createThemeTemplate: EventTemplate = {
    func: createTheme,
    template: [
        'title',
        'brandingWhite',
        'brandingDarkenWhite',
        'brandingDark',
        'brandingDarkenDark',
    ],
    schema: new StringSchema({
        title: {
            minLength: 2,
            maxLength: 20,
            regex: /[a-zA-Z0-9]/,
        },

        brandingWhite: {
            length: 6,
            regex: /[0-9]/,
        },

        brandingDarkenWhite: {
            length: 6,
            regex: /[0-9]/,
        },

        brandingDark: {
            length: 6,
            regex: /[0-9]/,
        },

        brandingDarkenDark: {
            length: 6,
            regex: /[0-9]/,
        },
    }),
};

export default createThemeTemplate;
