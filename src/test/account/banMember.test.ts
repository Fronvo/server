// ******************** //
// The test file for the banMember event.
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
        'banMember',
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
        'banMember',
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
        'banMember',
        {
            profileId: generateChars(),
        },
        ({ err }) => {
            callback(assertCode(err.code, 'NOT_IN_THIS_ROOM'));
        }
    );
}

function banMember(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'banMember',
        {
            profileId: shared.secondaryProfileId,
        },
        ({ err }) => {
            callback(assertError({ err }));

            // Attempt to rejoin, should fail
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
                                if (err) {
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
                                } else {
                                    callback(
                                        assertError({
                                            err: {
                                                code: 0,
                                                msg: "Shouldn't be able to rejoin room after being banned.",
                                                name: 'SHOULDNT_REJOIN',
                                            },
                                        })
                                    );
                                }
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
        banMember
    );
};
