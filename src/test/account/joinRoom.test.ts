// ******************** //
// The test file for the joinRoom event.
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

function lengthRoomIdMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'joinRoom',
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
        'joinRoom',
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
        'joinRoom',
        {
            roomId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'ROOM_NOT_FOUND'));
        }
    );
}

function joinRoom(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'joinRoom',
        {
            roomId: 'fronvo',
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

            for (const memberIndex in roomData.members) {
                callback(
                    assertType(
                        { member: roomData.members[memberIndex] },
                        'string'
                    )
                );
            }

            socket.emit('leaveRoom', () => {
                socket.emit(
                    'createRoom',
                    {
                        name: generateChars(5),
                    },
                    ({ roomData }) => {
                        // Add second profile to this room aswell, (kick ban etc.)
                        socket.emit('logout', () => {
                            socket.emit(
                                'loginToken',
                                {
                                    token: sharedVariables.secondaryProfileToken,
                                },
                                () => {
                                    socket.emit(
                                        'joinRoom',
                                        {
                                            roomId: roomData.roomId,
                                        },
                                        () => {
                                            socket.emit('logout', () => {
                                                socket.emit(
                                                    'loginToken',
                                                    {
                                                        token: sharedVariables.token,
                                                    },
                                                    () => {
                                                        // Update roomId
                                                        setTestVariable(
                                                            'createdRoomId',
                                                            roomData.roomId
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
    testArgs.socket.emit('leaveRoom', () => {
        assertErrors(
            {
                lengthRoomIdMin,
                lengthRoomIdMax,
                roomNotFound,
            },
            testArgs,
            joinRoom
        );
    });
};
