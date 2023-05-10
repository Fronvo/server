// ******************** //
// The test file for the fetchRoomData event.
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

function lengthRoomIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomData',
        {
            roomId: generateChars(1),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'roomId')
            );
        }
    );
}

function lengthRoomIdMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomData',
        {
            roomId: generateChars(16),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'roomId')
            );
        }
    );
}

function roomNotFound(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomData',
        {
            roomId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'ROOM_NOT_FOUND'));
        }
    );
}

function fetchRoomData(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchRoomData',
        {
            roomId: shared.createdRoomId,
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
                    assertType({ members: roomData.members }, 'object') ||
                    assertType(
                        { totalMessages: roomData.totalMessages },
                        'number'
                    )
            );

            for (const memberIndex in roomData.members) {
                callback(
                    assertType(
                        { member: roomData.members[memberIndex] },
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
            lengthRoomIdMin,
            lengthRoomIdMax,
            roomNotFound,
        },
        testArgs,
        fetchRoomData
    );
};
