// ******************** //
// The findProfiles account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { maxResultsSchema, profileIdSearchSchema } from 'events/shared';
import {
    FindProfilesResult,
    FindProfilesServerParams,
} from 'interfaces/account/findProfiles';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { prismaClient } from 'variables/global';

async function findProfiles({
    profileId,
    maxResults,
}: FindProfilesServerParams): Promise<FindProfilesResult | FronvoError> {
    const fetchedFindResults = await prismaClient.account.findMany({
        where: {
            OR: {
                profileId: {
                    contains: profileId,
                    mode: 'insensitive',
                },

                username: {
                    contains: profileId,
                    mode: 'insensitive',
                },
            },
        },
        // Default to 10
        take: Number(maxResults) || 10,
        select: {
            profileId: true,
            followers: true,
        },
        orderBy: {
            followers: 'desc',
        },
    });

    // Just return the result no matter the result count
    // Only the IDs
    const findResults = [];

    for (const result in fetchedFindResults) {
        findResults.push(fetchedFindResults[result].profileId);
    }

    return { findResults };
}

const findProfilesTemplate: EventTemplate = {
    func: findProfiles,
    template: ['profileId', 'maxResults'],
    schema: new StringSchema({
        ...profileIdSearchSchema,
        ...maxResultsSchema,
    }),
};

export default findProfilesTemplate;
