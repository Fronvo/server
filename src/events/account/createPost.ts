// ******************** //
// The createPost account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    CreatePostResult,
    CreatePostServerParams,
} from 'interfaces/account/createPost';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { getSocketAccountId, updateAccount } from 'utilities/global';

async function createPost({
    socket,
    title,
    attachment,
    content,
}: CreatePostServerParams): Promise<CreatePostResult | FronvoError> {
    const postDict = {
        title,
        content,
        attachment,
        creationDate: new Date(),
    };

    postDict['title'] = title.replace(/\n\n/g, '\n');
    postDict['content'] = content.replace(/\n\n/g, '\n');

    await updateAccount(
        {
            posts: postDict,
        },
        { id: getSocketAccountId(socket.id) },
        true
    );

    return postDict;
}

const updateProfileDataTemplate: EventTemplate = {
    func: createPost,
    template: ['title', 'content', 'attachment'],
    points: 5,
    schema: new StringSchema({
        title: {
            minLength: 5,
            maxLength: 30,
        },

        content: {
            minLength: 10,
            maxLength: 128,
        },

        attachment: {
            maxLength: 256,
            regex: /^(https:\/\/).+$/,
            optional: true,
        },
    }),
};

export default updateProfileDataTemplate;
