// ******************** //
// The test file for the sendRoomMessage event.
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

function lengthMessageMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'sendRoomMessage',
        {
            message: generateChars(501),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'message')
            );
        }
    );
}

function sendRoomMessage(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.on('newRoomMessage', ({ newMessageData }) => {
        const newMessage = newMessageData.message;

        callback(
            assertType({ roomId: newMessage.roomId }, 'string') ||
                assertType({ ownerId: newMessage.ownerId }, 'string') ||
                assertType({ messageId: newMessage.messageId }, 'string') ||
                assertType({ description: newMessage.content }, 'string') ||
                assertNotEqual(
                    { creationDate: new Date(newMessage.creationDate) },
                    'Invalid Date'
                )
        );

        shared.setTestVariable('sharedMessageId', newMessage.messageId);

        done();
    });

    socket.emit(
        'sendRoomMessage',
        {
            message: generateChars(10),
        },
        ({ err }): void => {
            callback(assertError({ err }));
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthMessageMax,
        },
        testArgs,
        sendRoomMessage
    );
};
