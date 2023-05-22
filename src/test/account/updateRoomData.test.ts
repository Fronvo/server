// ******************** //
// The test file for the updateRoomData event.
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

function lengthRoomIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateRoomData',
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
        'updateRoomData',
        {
            roomId: generateChars(31),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'roomId')
            );
        }
    );
}

function lengthNameMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateRoomData',
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
        'updateRoomData',
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

function lengthIconMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateRoomData',
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

function invalidRoomId(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateRoomData',
        {
            roomId: shared.createdRoomId,
        },
        ({ err }) => {
            callback(assertCode(err.code, 'INVALID_ID'));
        }
    );
}

function updateRoomData(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'updateRoomData',
        {
            roomId: generateChars(),
            name: generateChars(),
            description: generateChars(15),
            icon: `https://${generateChars()}`,
        },
        ({ err, roomData }): void => {
            callback(assertError({ err }));

            callback(
                assertType({ roomId: roomData.roomId }, 'string') ||
                    assertType({ name: roomData.name }, 'string') ||
                    assertType({ icon: roomData.icon }, 'string')
            );

            setTestVariable('createdRoomId', roomData.roomId);

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthRoomIdMin,
            lengthRoomIdMax,
            lengthNameMin,
            lengthNameMax,
            lengthIconMax,
            invalidRoomId,
        },
        testArgs,
        updateRoomData
    );
};
