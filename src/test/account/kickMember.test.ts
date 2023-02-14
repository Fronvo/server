// ******************** //
// The test file for the kickMember event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import shared from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    generateChars,
} from 'test/utilities';

function lengthProfileIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'kickMember',
        {
            profileId: generateChars(4),
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
        'kickMember',
        {
            profileId: generateChars(31),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'profileId')
            );
        }
    );
}

function notInThisCommunity(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'kickMember',
        {
            profileId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'NOT_IN_THIS_COMMUNITY'));
        }
    );
}

function kickMember(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'kickMember',
        {
            profileId: shared.secondaryProfileId,
        },
        ({ err }) => {
            callback(assertError({ err }));

            // Add second profile to the community again (ban etc.)
            socket.emit('logout', () => {
                socket.emit(
                    'loginToken',
                    { token: shared.secondaryProfileToken },
                    () => {
                        socket.emit(
                            'joinCommunity',
                            {
                                communityId: shared.createdCommunityId,
                            },
                            ({ err }) => {
                                callback(assertError({ err }));

                                // Relogin to main socket
                                socket.emit('logout', () => {
                                    socket.emit(
                                        'loginToken',
                                        { token: shared.token },
                                        () => {
                                            done();
                                        }
                                    );
                                });
                            }
                        );
                    }
                );
            });
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthProfileIdMin,
            lengthProfileIdMax,
            notInThisCommunity,
        },
        testArgs,
        kickMember
    );
};
