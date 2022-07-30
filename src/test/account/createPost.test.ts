// ******************** //
// The test file for the createPost event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    generateChars,
} from 'test/utilities';

function lengthTitleMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            title: generateChars(4),
            content: generateChars(10),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'title')
            );
        }
    );
}

function lengthTitleMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            title: generateChars(31),
            content: generateChars(10),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'title')
            );
        }
    );
}

function lengthContentMin(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            title: generateChars(5),
            content: generateChars(9),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'content')
            );
        }
    );
}

function lengthContentMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            title: generateChars(5),
            content: generateChars(129),
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'content')
            );
        }
    );
}

function lengthAttachmentMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            title: generateChars(5),
            content: generateChars(10),
            attachment: `https://${generateChars(257)}`,
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'attachment')
            );
        }
    );
}

function createPost(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'createPost',
        {
            title: generateChars(5),
            content: generateChars(10),
            attachment: `https://${generateChars(10)}`,
        },
        ({ err }): void => {
            callback(assertError({ err }));

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthTitleMin,
            lengthTitleMax,
            lengthContentMin,
            lengthContentMax,
            lengthAttachmentMax,
        },
        testArgs,
        createPost
    );
};
