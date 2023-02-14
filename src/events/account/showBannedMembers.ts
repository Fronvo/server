// ******************** //
// The showBannedMembers account event file.
// ******************** //

import { Account } from '@prisma/client';
import {
    ShowBannedMembersResult,
    ShowBannedMembersServerParams,
} from 'interfaces/account/showBannedMembers';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function showBannedMembers({
    socket,
}: ShowBannedMembersServerParams): Promise<
    ShowBannedMembersResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    // Must be in community
    if (!account.isInCommunity) {
        return generateError('NOT_IN_COMMUNITY');
    }

    const community = await prismaClient.community.findFirst({
        where: {
            communityId: account.communityId,
        },
    });

    // Must be the owner
    if (!(account.profileId == community.ownerId)) {
        return generateError('NOT_COMMUNITY_OWNER');
    }

    const bannedMembers: Partial<Account>[] = [];

    for (const memberIndex in community.bannedMembers) {
        const bannedMember = await prismaClient.account.findFirst({
            where: {
                profileId:
                    community.bannedMembers[Number(memberIndex)].toString(),
            },

            select: {
                avatar: true,
                banner: true,
                bio: true,
                creationDate: true,
                followers: true,
                following: true,
                isPrivate: true,
                profileId: true,
                username: true,
                isAdmin: true,
                isDisabled: true,
                isInCommunity: true,
                communityId: true,
            },
        });

        bannedMembers.push(bannedMember);
    }

    return { bannedMembers };
}

const showBannedMembersTemplate: EventTemplate = {
    func: showBannedMembers,
    template: [],
};

export default showBannedMembersTemplate;
