// ******************** //
// The fetchThemes account event file.
// ******************** //

import {
    FetchThemesResult,
    FetchThemesServerParams,
} from 'interfaces/account/fetchThemes';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchThemes({
    socket,
}: FetchThemesServerParams): Promise<FetchThemesResult | FronvoError> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    if (!account.isPRO) {
        return generateError('PRO_REQUIRED');
    }

    const themes = await prismaClient.theme.findMany({
        select: {
            title: true,
            brandingWhite: true,
            brandingDarkenWhite: true,
            brandingDark: true,
            brandingDarkenDark: true,
        },
    });

    return { themes };
}

const fetchThemesTemplate: EventTemplate = {
    func: fetchThemes,
    template: [],
};

export default fetchThemesTemplate;
