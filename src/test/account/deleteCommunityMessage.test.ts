// ******************** //
// The test file for the deleteCommunityMessage event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
} from 'test/utilities';
import { v4 } from 'uuid';

function invalidMessageIdType(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deleteCommunityMessage',
        {
            messageId: v4().replace(/-/, 'a'),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'REQUIRED_UUID') ||
                    assertEquals({ for: err.extras.for }, 'messageId')
            );
        }
    );
}

function invalidMessage(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deleteCommunityMessage',
        {
            messageId: v4(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_MESSAGE'));
        }
    );
}

function deleteCommunityMessage(
    { socket, done, shared }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deleteCommunityMessage',
        {
            messageId: shared.sharedMessageId,
        },
        ({ err }): void => {
            callback(assertError({ err }));
        }
    );

    // Attach asynchronously
    socket.on('communityMessageDeleted', ({ messageId }) => {
        callback(assertEquals({ messageId }, shared.sharedMessageId));

        done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            invalidMessageIdType,
            invalidMessage,
        },
        testArgs,
        deleteCommunityMessage
    );
};
