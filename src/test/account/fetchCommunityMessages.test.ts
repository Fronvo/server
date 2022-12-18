// ******************** //
// The test file for the fetchCommunityMessages event.
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
        'fetchCommunityMessages',
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
        'fetchCommunityMessages',
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
        'fetchCommunityMessages',
        {
            from: '0',
            to: '101',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'TOO_MUCH_LOAD'));
        }
    );
}

function fetchCommunityMessages(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchCommunityMessages',
        {
            from: '0',
            to: '2',
        },
        ({ err, communityMessages }): void => {
            callback(assertError({ err }));

            const targetMessage = communityMessages[0];

            callback(
                assertType(
                    { communityId: targetMessage.communityId },
                    'string'
                ) ||
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
                    assertType({ replyId: targetMessage.replyId }, 'string') ||
                    assertType({ isReply: targetMessage.isReply }, 'boolean')
            );

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        { lengthFromMax, lengthToMax, loadMore100 },
        testArgs,
        fetchCommunityMessages
    );
};
