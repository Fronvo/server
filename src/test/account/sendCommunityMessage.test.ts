// ******************** //
// The test file for the sendCommunityMessage event.
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
        'sendCommunityMessage',
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

function sendCommunityMessage(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.on('newCommunityMessage', ({ newMessageData }) => {
        callback(
            assertType({ communityId: newMessageData.communityId }, 'string') ||
                assertType({ ownerId: newMessageData.ownerId }, 'string') ||
                assertType({ messageId: newMessageData.messageId }, 'string') ||
                assertType({ description: newMessageData.content }, 'string') ||
                assertNotEqual(
                    { creationDate: new Date(newMessageData.creationDate) },
                    'Invalid Date'
                )
        );

        shared.setTestVariable('sharedMessageId', newMessageData.messageId);

        done();
    });

    socket.emit(
        'sendCommunityMessage',
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
        sendCommunityMessage
    );
};
