// ******************** //
// The test file for the fetchRoomMessages event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertNotEqual,
    assertType,
} from 'test/utilities';

function lengthFromMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomMessages',
        {
            from: '10000000',
            to: '10',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'from')
            );
        }
    );
}

function lengthToMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomMessages',
        {
            from: '10',
            to: '10000000',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'to')
            );
        }
    );
}

function loadMore100(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomMessages',
        {
            from: '0',
            to: '101',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'TOO_MUCH'));
        }
    );
}

function fetchRoomMessages(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomMessages',
        {
            from: '0',
            to: '2',
        },
        ({ err, roomMessages }): void => {
            callback(assertError({ err }));

            const targetMessage = roomMessages[0].message;

            callback(
                assertType({ roomId: targetMessage.roomId }, 'string') ||
                    assertType({ ownerId: targetMessage.ownerId }, 'string') ||
                    assertType({ content: targetMessage.content }, 'string') ||
                    assertType(
                        { messageId: targetMessage.messageId },
                        'string'
                    ) ||
                    assertNotEqual(
                        { creationDate: new Date(targetMessage.creationDate) },
                        'Invalid Date'
                    ) ||
                    assertType({ isReply: targetMessage.isReply }, 'boolean') ||
                    assertType(
                        { replyContent: targetMessage.replyContent },
                        'string'
                    )
            );

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        { lengthFromMax, lengthToMax, loadMore100 },
        testArgs,
        fetchRoomMessages
    );
};
