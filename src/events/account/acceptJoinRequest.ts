// ******************** //
// The acceptJoinRequest account event file.
// ******************** //

import bcrypt from 'bcrypt';
import {
    AcceptJoinRequestResult,
    AcceptJoinRequestServerParams,
} from 'interfaces/account/acceptJoinRequest';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateChars } from 'test/utilities';
import { generateError, getSocketAccountId } from 'utilities/global';
import * as variables from 'variables/global';
import { prismaClient } from 'variables/global';
import { sendEmail } from 'utilities/global';
import { StringSchema } from '@ezier/validate';

async function acceptJoinRequest({
    socket,
    email,
}: AcceptJoinRequestServerParams): Promise<
    AcceptJoinRequestResult | FronvoError
> {
    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },
    });

    const isAdmin = account.isAdmin || account.profileId == 'fronvo';

    if (!isAdmin) {
        return generateError('NOT_ADMIN');
    }

    const joinRequests = await prismaClient.joinRequests.findMany({});

    for (const request in joinRequests) {
        const target = joinRequests[request];

        if (target.email == email) {
            const username = `Fronvo user ${
                (await prismaClient.account.count()) + 1
            }`;

            // abcdef12345
            const profileId = generateChars(10);

            await prismaClient.account.create({
                data: {
                    profileId,
                    email,
                    password:
                        !variables.testMode || variables.setupMode
                            ? bcrypt.hashSync(
                                  target.password,
                                  variables.mainBcryptHash
                              )
                            : target.password,
                    username,
                    isPrivate: false,
                    following: [],
                    followers: [],
                    isAdmin: profileId == 'fronvo',
                },
            });

            sendEmail(email, 'Welcome to Fronvo!', [
                "We're so glad to have you on our platform!",
                'Enjoy your stay on the safest social media!',
            ]);

            await prismaClient.joinRequests.delete({
                where: {
                    email,
                },
            });

            return {};
        }
    }

    return generateError('REQUEST_DOESNT_EXIST');
}

const acceptJoinRequestTemplate: EventTemplate = {
    func: acceptJoinRequest,
    template: ['email'],
    schema: new StringSchema({
        email: {
            minLength: 8,
            maxLength: 120,
            type: 'email',
        },
    }),
};

export default acceptJoinRequestTemplate;
