// ******************** //
// The test file for the deletePost event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import shared from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
} from 'test/utilities';
import { v4 } from 'uuid';

function invalidPostIdType(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deletePost',
        {
            postId: v4().replace(/-/, 'a'),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'REQUIRED_UUID') ||
                    assertEquals({ for: err.extras.for }, 'postId')
            );
        }
    );
}

function invalidPost(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deletePost',
        {
            postId: v4(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_POST'));
        }
    );
}

function deletePost(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deletePost',
        {
            postId: shared.sharedPostId,
        },
        ({ err }): void => {
            callback(assertError({ err }));

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            invalidPostIdType,
            invalidPost,
        },
        testArgs,
        deletePost
    );
};
