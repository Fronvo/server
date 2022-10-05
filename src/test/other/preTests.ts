// The file preceding any tests, for possible prod changes.

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertError,
    assertErrors,
    generateEmail,
    generatePassword,
} from 'test/utilities';

async function createOfficialAccount(
    { socket }: TestArguments,
    callback: TestErrorCallback
): Promise<void> {
    return new Promise((resolve) => {
        socket.emit(
            'register',
            { email: generateEmail(), password: generatePassword() },
            () => {
                socket.emit('registerVerify', { code: '123456' }, ({ err }) => {
                    callback(assertError({ err }));

                    socket.emit(
                        'updateProfileData',
                        {
                            profileId: 'fronvo',
                            username: 'Fronvo',
                            bio: 'The official account of Fronvo',
                        },
                        () => {
                            // Ignore if it already exists
                            resolve();
                        }
                    );
                });
            }
        );
    });
}

async function createOfficialCommunity(
    { socket }: TestArguments,
    callback: TestErrorCallback
): Promise<void> {
    return new Promise((resolve) => {
        socket.emit(
            'createCommunity',
            {
                name: 'Fronvo',
                description: 'The official community of Fronvo.',
                icon: 'https://i.ibb.co/QFT7SNj/logo.png',
            },
            ({ err }) => {
                callback(assertError({ err }));

                socket.emit(
                    'updateCommunityData',
                    {
                        communityId: 'fronvo',
                    },
                    ({ err }) => {
                        callback(assertError({ err }));

                        resolve();
                    }
                );
            }
        );
    });
}

async function preTests(
    testArgs: TestArguments,
    callback: TestErrorCallback
): Promise<void> {
    await createOfficialAccount(testArgs, callback);
    await createOfficialCommunity(testArgs, callback);

    testArgs.socket.emit('logout', () => {
        testArgs.done();
    });
}

export default (testArgs: TestArguments): void => {
    assertErrors({}, testArgs, preTests);
};
