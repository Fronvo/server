// ******************** //
// The test file for the joinCommunity event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
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
            communityId: generateChars(4),
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
                    assertType(
                        { description: communityData.description },
                        'string'
                    ) ||
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

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthCommunityIdMin,
            lengthCommunityIdMax,
            communityNotFound,
        },
        testArgs,
        joinCommunity
    );
};
