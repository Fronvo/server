// The file preceding any tests, for possible prod changes.

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertError,
    assertErrors,
    generateEmail,
    generatePassword,
} from 'test/utilities';

function preTests(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'register',
        { email: generateEmail(), password: generatePassword() },
        ({ err }) => {
            callback(assertError({ err }));

            socket.emit('registerVerify', { code: '123456' }, ({ err }) => {
                callback(assertError({ err }));

                socket.emit(
                    'updateProfileData',
                    {
                        profileId: 'fronvo',
                        username: 'Fronvo',
                        bio: 'The official account of Fronvo',
                    },
                    ({ err }) => {
                        callback(assertError({ err }));

                        socket.emit('logout', ({ err }) => {
                            callback(assertError({ err }));

                            done();
                        });
                    }
                );
            });
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, preTests);
};
