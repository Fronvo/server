// ******************** //
// The requestData account event file.
// ******************** //

import { differenceInDays, differenceInMonths } from 'date-fns';
import ImageKit from 'imagekit';
import {
    RequestDataResult,
    RequestDataServerParams,
} from 'interfaces/account/requestData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, sendEmail } from 'utilities/global';
import { v4 } from 'uuid';
import {
    imagekitEndpoint,
    imagekitFreeEndpoint,
    imagekitFreePrivate,
    imagekitFreePublic,
    imagekitPrivate,
    imagekitPublic,
    prismaClient,
} from 'variables/global';

async function requestData({
    account,
}: RequestDataServerParams): Promise<RequestDataResult | FronvoError> {
    if (!imagekitEndpoint || !imagekitPublic || !imagekitPrivate) {
        return generateError('UNKNOWN');
    }

    if (differenceInMonths(new Date(), new Date(account.dataSentTime)) < 1) {
        return generateError('DO_AGAIN', undefined, [
            30 - differenceInDays(new Date(), new Date(account.dataSentTime)),
            'days',
        ]);
    }

    await prismaClient.account.update({
        where: {
            profileId: account.profileId,
        },

        data: {
            dataSentTime: new Date(),
        },
    });

    const imagekit = new ImageKit({
        urlEndpoint: account.isPRO ? imagekitEndpoint : imagekitFreeEndpoint,
        publicKey: account.isPRO ? imagekitPublic : imagekitFreePublic,
        privateKey: account.isPRO ? imagekitPrivate : imagekitFreePrivate,
    });

    const res = await imagekit.upload({
        fileName: `${v4()}-data.json`,
        file: btoa(
            JSON.stringify(
                await prismaClient.account.findFirst({
                    where: {
                        profileId: account.profileId,
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
