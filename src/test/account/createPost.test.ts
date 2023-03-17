// ******************** //
// The test file for the createPost event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import * as shared from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertNotEqual,
    assertType,
    generateChars,
} from 'test/utilities';

function lengthContentMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            content: generateChars(513),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'content')
            );
        }
    );
}

function lengthAttachmentMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            content: generateChars(15),
            attachment: `https://${generateChars(513)}`,
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'attachment')
            );
        }
    );
}

function createPost(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            content: generateChars(15),
            attachment: `https://${generateChars(10)}`,
        },
        ({ err, postData }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ postId: postData.postId }, 'string') ||
                    assertType({ author: postData.author }, 'string') ||
                    assertType({ content: postData.content }, 'string') ||
                    assertType({ attachment: postData.attachment }, 'string') ||
                    assertNotEqual(
                        { creationDate: new Date(postData.creationDate) },
                        'Invalid Date'
                    )
            );

            shared.setTestVariable('sharedPostId', postData.postId);

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthContentMax,
            lengthAttachmentMax,
        },
        testArgs,
        createPost
    );
};
