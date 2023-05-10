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

function notInThisRoom(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'kickMember',
        {
            profileId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'NOT_IN_THIS_ROOM'));
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

            // Add second profile to the room again (ban etc.)
            socket.emit('logout', () => {
                socket.emit(
                    'loginToken',
                    { token: shared.secondaryProfileToken },
                    () => {
                        socket.emit(
                            'joinRoom',
                            {
                                roomId: shared.createdRoomId,
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
            notInThisRoom,
        },
        testArgs,
        kickMember
    );
};
