// ******************** //
// The updateProfileData account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    UpdateProfileDataResult,
    UpdateProfileDataServerParams,
} from 'interfaces/account/updateProfileData';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, updateAccount } from 'utilities/global';

async function updateProfileData({
    socket,
    username,
    avatar,
}: UpdateProfileDataServerParams): Promise<
    UpdateProfileDataResult | FronvoError
> {
    // Username validation not needed here, see schema below
    // Nor avatar, may need for content-type and extension if applicable (|| ?)

    // Proceed to update info
    await updateAccount(
        {
            username,
            avatar,
        },
        { id: getSocketAccountId(socket.id) }
    );

    return {};
}

const updateProfileDataTemplate: EventTemplate = {
    func: updateProfileData,
    template: ['username', 'avatar'],
    points: 3,
    schema: new StringSchema({
        username: {
            minLength: 5,
            maxLength: 30,
        },

        avatar: {
            // Ensure https
            regex: /^(https:\/\/).+$/,
            maxLength: 512,
        },
    }),
};

export default updateProfileDataTemplate;
