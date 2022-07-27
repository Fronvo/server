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
            title: generateChars(2),
            content: generateChars(5),
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
            title: generateChars(51),
            content: generateChars(5),
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
            title: generateChars(3),
            content: generateChars(4),
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
            title: generateChars(3),
            content: generateChars(257),
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
            title: generateChars(3),
            content: generateChars(5),
            attachment: `https://${generateChars(513)}`,
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
            title: generateChars(3),
            content: generateChars(5),
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
