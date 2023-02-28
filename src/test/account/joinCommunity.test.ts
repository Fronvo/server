// ******************** //
// The test file for the joinCommunity event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import sharedVariables, { setTestVariable } from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertNotEqual,
    assertType,
    generateChars,
} from 'test/utilities';

function lengthCommunityIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'joinCommunity',
        {
            communityId: generateChars(1),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'communityId')
            );
        }
    );
}

function lengthCommunityIdMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'joinCommunity',
        {
            communityId: generateChars(16),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'communityId')
            );
        }
    );
}

function communityNotFound(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'joinCommunity',
        {
            communityId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'COMMUNITY_NOT_FOUND'));
        }
    );
}

function joinCommunity(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'joinCommunity',
        {
            communityId: 'fronvo',
        },
        ({ err, communityData }): void => {
            callback(assertError({ err }));

            callback(
                assertType(
                    { communityId: communityData.communityId },
                    'string'
                ) ||
                    assertType({ ownerId: communityData.ownerId }, 'string') ||
                    assertType({ name: communityData.name }, 'string') ||
                    assertType({ icon: communityData.icon }, 'string') ||
                    assertNotEqual(
                        { creationDate: new Date(communityData.creationDate) },
                        'Invalid Date'
                    ) ||
                    assertType({ members: communityData.members }, 'object')
            );

            for (const memberIndex in communityData.members) {
                callback(
                    assertType(
                        { member: communityData.members[memberIndex] },
                        'string'
                    )
                );
            }

            socket.emit('leaveCommunity', () => {
                socket.emit(
                    'createCommunity',
                    {
                        name: generateChars(5),
                    },
                    ({ communityData }) => {
                        // Add second profile to this community aswell, (kick ban etc.)
                        socket.emit('logout', () => {
                            socket.emit(
                                'loginToken',
                                {
                                    token: sharedVariables.secondaryProfileToken,
                                },
                                () => {
                                    socket.emit(
                                        'joinCommunity',
                                        {
                                            communityId:
                                                communityData.communityId,
                                        },
                                        () => {
                                            socket.emit('logout', () => {
                                                socket.emit(
                                                    'loginToken',
                                                    {
                                                        token: sharedVariables.token,
                                                    },
                                                    () => {
                                                        // Update communityId
                                                        setTestVariable(
                                                            'createdCommunityId',
                                                            communityData.communityId
                                                        );

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
            });
        }
    );
}

export default (testArgs: TestArguments): void => {
    testArgs.socket.emit('leaveCommunity', () => {
        assertErrors(
            {
                lengthCommunityIdMin,
                lengthCommunityIdMax,
                communityNotFound,
            },
            testArgs,
            joinCommunity
        );
    });
};
