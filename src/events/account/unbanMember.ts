// ******************** //
// The unbanMember account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    UnbanMemberResult,
    UnbanMemberServerParams,
} from 'interfaces/account/unbanMember';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, generateError } from 'utilities/global';
import { prismaClient } from 'variables/global';

async function unbanMember({
    socket,
    profileId,
}: UnbanMemberServerParams): Promise<UnbanMemberResult | FronvoError> {
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

    // Check if member with id is banned
    if (!community.bannedMembers.includes(profileId)) {
        return generateError('MEMBER_NOT_BANNED');
    }

    // Remove from banned members list
    const newBannedMembers = community.bannedMembers;

    newBannedMembers.splice(newBannedMembers.indexOf(profileId), 1);

    await prismaClient.community.update({
        where: {
            communityId: community.communityId,
        },

        data: {
            bannedMembers: newBannedMembers,
        },
    });

    return {};
}

const unbanMemberTemplate: EventTemplate = {
    func: unbanMember,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default unbanMemberTemplate;
