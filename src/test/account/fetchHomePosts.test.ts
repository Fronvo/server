// ******************** //
// The test file for the fetchHomePosts event.
// ******************** //

import { TestArguments, TestErrorCallback } from 'interfaces/test';
import {
    assertCode,
    assertEquals,
    assertError,
    assertErrors,
    assertType,
} from 'test/utilities';

function lengthFromMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchHomePosts',
        {
            from: '10000000',
            to: '10',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'from')
            );
        }
    );
}

function lengthToMax(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchHomePosts',
        {
            from: '10',
            to: '10000000',
        },
        ({ err }) => {
            callback(
                assertCode(err.code, 'LENGTH') ||
                    assertEquals({ for: err.extras.for }, 'to')
            );
        }
    );
}

function fromIsHigher(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchHomePosts',
        {
            from: '2',
            to: '1',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'NOT_HIGHER_NUMBER'));
        }
    );
}

function loadMore30(
    { socket }: Partial<TestArguments>,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchHomePosts',
        {
            from: '0',
            to: '31',
        },
        ({ err }) => {
            callback(assertCode(err.code, 'TOO_MUCH_LOAD'));
        }
    );
}

function fetchHomePosts(
    { socket, done }: TestArguments,
    callback: TestErrorCallback
): void {
    socket.emit(
        'fetchHomePosts',
        { from: '0', to: '1' },
        ({ err, homePosts }): void => {
            callback(assertError({ err }));

            callback(assertType({ homePosts }, 'object'));

            done();
        }
    );
}

export default (testArgs: TestArguments): void => {
    assertErrors(
        {
            lengthFromMax,
            lengthToMax,
            fromIsHigher,
            loadMore30,
        },
        testArgs,
        fetchHomePosts
    );
};
