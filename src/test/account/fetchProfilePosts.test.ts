// ******************** //
// The test file for the fetchProfilePosts event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import shared from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertNotEqual,
    assertType,
    generateChars,
} from 'test/utilities';

function lengthProfileIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfilePosts',
        {
            profileId: generateChars(4),
            from: '0',
            to: '10',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'profileId')
            );
        }
    );
}

function lengthProfileIdMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfilePosts',
        {
            profileId: generateChars(31),
            from: '0',
            to: '10',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'profileId')
            );
        }
    );
}

function lengthFromMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfilePosts',
        {
            profileId: generateChars(),
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
        'fetchProfilePosts',
        {
            profileId: generateChars(),
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

function profileNotFound(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfilePosts',
        {
            profileId: generateChars(),
            from: '0',
            to: '10',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'PROFILE_NOT_FOUND'));
        }
    );
}

function fromIsHigher(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfilePosts',
        {
            profileId: shared.profileId,
            from: '2',
            to: '1',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'NOT_HIGHER_NUMBER'));
        }
    );
}

function loadMore20(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfilePosts',
        {
            profileId: shared.profileId,
            from: '0',
            to: '21',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'TOO_MUCH_LOAD'));
        }
    );
}

function fetchProfilePosts(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchProfilePosts',
        {
            profileId: shared.profileId,
            from: '0',
            to: '10',
        },
        ({ err, profilePosts }): void => {
            callback(assertError({ err }));

            const targetPost = profilePosts[0];

            callback(
                assertType({ postId: targetPost.postId }, 'string') ||
                    assertType({ author: targetPost.author }, 'string') ||
                    assertType({ title: targetPost.title }, 'string') ||
                    assertType({ content: targetPost.content }, 'string') ||
                    assertType(
                        { attachment: targetPost.attachment },
                        'string'
                    ) ||
                    assertNotEqual(
                        { creationDate: new Date(targetPost.creationDate) },
                        'Invalid Date'
                    )
            );

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthProfileIdMin,
            lengthProfileIdMax,
            lengthFromMax,
            lengthToMax,
            profileNotFound,
            fromIsHigher,
            loadMore20,
        },
        testArgs,
        fetchProfilePosts
    );
};
