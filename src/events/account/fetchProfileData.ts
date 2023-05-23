// ******************** //
// The fetchProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    FetchedFronvoAccount,
    FetchProfileDataResult,
    FetchProfileDataServerParams,
} from 'interfaces/account/fetchProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import {
    generateError,
    getAccountSocketId,
    getSocketAccountId,
} from 'utilities/global';
import { prismaClient } from 'variables/global';

async function fetchProfileData({
    socket,
    profileId,
}: FetchProfileDataServerParams): Promise<
    FetchProfileDataResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!account) {
        return generateError('INVALID', undefined, ['profile ID']);
    }

    const isSelf = getSocketAccountId(socket.id) == profileId;

    // Block access to most info if private
    const profileData: FetchedFronvoAccount = {
        isSelf,
        profileId: account.profileId,
        username: account.username,
        bio: account.bio,
        creationDate: account.creationDate || new Date(),
        avatar: account.avatar,
        banner: account.banner,
        online: getAccountSocketId(profileId) != '',
    };

    // More data if our profile
    if (profileData.isSelf) {
        profileData.email = account.email;
        profileData.isInRoom = account.isInRoom;
        profileData.roomId = account.roomId;
    }

    return { profileData };
}

const fetchProfileDataTemplate: EventTemplate = {
    func: fetchProfileData,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default fetchProfileDataTemplate;
