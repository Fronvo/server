// ******************** //
// The test file for the fetchCommunityMessages event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertError,
    assertErrors,
    assertNotEqual,
    assertType,
} from 'test/utilities';

function fetchCommunityMessages(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchCommunityMessages',
        ({ err, communityMessages }): void => {
            callback(assertError({ err }));

            const targetMessage = communityMessages[0];

            callback(
                assertType({ ownerId: targetMessage.ownerId }, 'string') ||
                    assertType({ content: targetMessage.content }, 'string') ||
                    assertType(
                        { messageId: targetMessage.messageId },
                        'string'
                    ) ||
                    assertNotEqual(
                        { creationDate: new Date(targetMessage.creationDate) },
                        'Invalid Date'
                    )
            );

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, fetchCommunityMessages);
};
