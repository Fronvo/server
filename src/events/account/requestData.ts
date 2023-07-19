// ******************** //
// The requestData account event file.
// ******************** //

import { differenceInMonths } from 'date-fns';
import ImageKit from 'imagekit';
import {
    RequestDataResult,
    RequestDataServerParams,
} from 'interfaces/account/requestData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getSocketAccountId, sendEmail } from 'utilities/global';
import { v4 } from 'uuid';
import {
    imagekitEndpoint,
    imagekitPrivate,
    imagekitPublic,
    prismaClient,
} from 'variables/global';

async function requestData({
    socket,
}: RequestDataServerParams): Promise<RequestDataResult | FronvoError> {
    if (!imagekitEndpoint || !imagekitPublic || !imagekitPrivate) {
        return generateError('UNKNOWN');
    }

    const account = await prismaClient.account.findFirst({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        select: {
            email: true,
            dataSentTime: true,
        },
    });

    if (differenceInMonths(new Date(), new Date(account.dataSentTime)) < 1) {
        return generateError('ALREADY_USED', undefined, [30, 'days']);
    }

    await prismaClient.account.update({
        where: {
            profileId: getSocketAccountId(socket.id),
        },

        data: {
            dataSentTime: new Date(),
        },
    });

    const imagekit = new ImageKit({
        urlEndpoint: imagekitEndpoint,
        publicKey: imagekitPublic,
        privateKey: imagekitPrivate,
    });

    const res = await imagekit.upload({
        fileName: `${v4()}-data.json`,
        file: btoa(
            JSON.stringify(
                await prismaClient.account.findFirst({
                    where: {
                        profileId: getSocketAccountId(socket.id),
                    },

                    select: {
                        profileId: true,
                        email: true,
                        username: true,
                        bio: true,
                        avatar: true,
                        banner: true,
                        creationDate: true,
                        status: true,
                        statusUpdatedTime: true,
                        pendingFriendRequests: true,
                        friends: true,
                        seenStates: true,
                        dataSentTime: true,
                    },
                })
            )
        ),
    });

    sendEmail(account.email, 'Your data is here!', [
        "This link includes all of your account's data, no exceptions (apart from your password ofcourse).",
        'Do not share it with anyone else, pretty please.',
        res.url,
    ]);

    return {};
}

const requestDataTemplate: EventTemplate = {
    func: requestData,
    template: [],
};

export default requestDataTemplate;