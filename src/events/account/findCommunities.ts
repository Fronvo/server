// ******************** //
// The findCommunities account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FindCommunitiesResult,
    FindCommunitiesServerParams,
} from 'interfaces/account/findCommunities';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { prismaClient } from 'variables/global';

async function findCommunities({
    name,
    maxResults,
}: FindCommunitiesServerParams): Promise<FindCommunitiesResult | FronvoError> {
    const fetchedFindResults = await prismaClient.community.findMany({
        where: {
            name: {
                contains: name,
                mode: 'insensitive',
            },
        },
        // Default to 10
        take: Number(maxResults) || 10,
        select: {
            communityId: true,
        },
        orderBy: {
            members: 'asc',
        },
    });

    // Just return the result no matter the result count
    // Only the IDs
    const findResults = [];

    for (const result in fetchedFindResults) {
        findResults.push(fetchedFindResults[result].communityId);
    }

    return { findResults };
}

const findCommunitiesTemplate: EventTemplate = {
    func: findCommunities,
    template: ['name', 'maxResults'],
    points: 5,
    schema: new StringSchema({
        name: {
            minLength: 1,
            maxLength: 15,
            regex: /^[a-z0-9]+$/,
        },

        maxResults: {
            minLength: 1,
            maxLength: 3,
            regex: /^[0-9]+$/,
            optional: true,
        },
    }),
};

export default findCommunitiesTemplate;
