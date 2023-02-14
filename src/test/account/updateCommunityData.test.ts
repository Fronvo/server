// ******************** //
// The test file for the updateCommunityData event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import shared, { setTestVariable } from 'test/shared';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertType,
    generateChars,
} from 'test/utilities';

function lengthCommunityIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            communityId: generateChars(2),
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
        'updateCommunityData',
        {
            communityId: generateChars(31),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'communityId')
            );
        }
    );
}

function lengthNameMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            name: generateChars(2),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'name')
            );
        }
    );
}

function lengthNameMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            name: generateChars(31),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'name')
            );
        }
    );
}

function lengthDescriptionMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            description: generateChars(129),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'description')
            );
        }
    );
}

function lengthIconMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            icon: `https://${generateChars(513)}`,
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'icon')
            );
        }
    );
}

function invalidInviteOnly(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            // @ts-ignore
            inviteOnly: '123',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'NOT_BOOLEAN'));
        }
    );
}

function invalidCommunityId(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            communityId: shared.createdCommunityId,
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_COMMUNITY_ID'));
        }
    );
}

function updateCommunityData(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateCommunityData',
        {
            communityId: generateChars(),
            name: generateChars(),
            description: generateChars(15),
            icon: `https://${generateChars()}`,
        },
        ({ err, communityData }): void => {
            callback(assertError({ err }));

            callback(
                assertType(
                    { communityId: communityData.communityId },
                    'string'
                ) ||
                    assertType({ name: communityData.name }, 'string') ||
                    assertType(
                        { desciption: communityData.description },
                        'string'
                    ) ||
                    assertType({ icon: communityData.icon }, 'string')
            );

            setTestVariable('createdCommunityId', communityData.communityId);

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthCommunityIdMin,
            lengthCommunityIdMax,
            lengthNameMin,
            lengthNameMax,
            lengthDescriptionMax,
            lengthIconMax,
            invalidInviteOnly,
            invalidCommunityId,
        },
        testArgs,
        updateCommunityData
    );
};
