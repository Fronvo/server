// ******************** //
// The test file for the deleteRoomMessage event.
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

function invalidMessageIdType(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deleteRoomMessage',
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
        'deleteRoomMessage',
        {
            messageId: v4(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_MESSAGE'));
        }
    );
}

function deleteRoomMessage(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'deleteRoomMessage',
        {
            messageId: shared.sharedMessageId,
        },
        ({ err }): void => {
            callback(assertError({ err }));
        }
    );

    // Attach asynchronously
    socket.on('roomMessageDeleted', ({ messageId }) => {
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
        deleteRoomMessage
    );
};
