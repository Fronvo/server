// ******************** //
// The test file for the createRoom event.
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

function lengthNameMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createRoom',
        {
            name: generateChars(1),
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
        'createRoom',
        {
            name: generateChars(16),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'name')
            );
        }
    );
}

function lengthIconMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createRoom',
        {
            name: generateChars(5),
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

function createRoom(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createRoom',
        {
            name: generateChars(5),
            icon: `https://${generateChars(10)}`,
        },
        ({ err, roomData }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ roomId: roomData.roomId }, 'string') ||
                    assertType({ ownerId: roomData.ownerId }, 'string') ||
                    assertType({ name: roomData.name }, 'string') ||
                    assertType({ icon: roomData.icon }, 'string') ||
                    assertNotEqual(
                        { creationDate: new Date(roomData.creationDate) },
                        'Invalid Date'
                    ) ||
                    assertType({ members: roomData.members }, 'object')
            );

            shared.setTestVariable('createdRoomId', roomData.roomId);
            shared.setTestVariable('createdRoomName', roomData.name);

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthNameMin,
            lengthNameMax,
            lengthIconMax,
        },
        testArgs,
        createRoom
    );
};
