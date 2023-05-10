// ******************** //
// The starting point of the Fronvo server's tests.
// ******************** //

// Variables
const PORT = process.env.PORT || 3001;

// Test files
import accountTests from 'test/account';
import generalTests from 'test/general';
import noAccountTests from 'test/noAccount';

// Other
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { TestArguments } from 'interfaces/test';
import { Socket } from 'socket.io';
import { io } from 'socket.io-client';
import postTests from './other/postTests';

// Create the client
// @ts-ignore
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    `ws://localhost:${PORT}`,
    {
        transports: ['websocket'],
        path: '/fronvo',
        reconnectionDelay: 100,
        reconnectionDelayMax: 200,
        reconnectionAttempts: 10,
        randomizationFactor: 0,
    }
);

describe('Fronvo', () => {
    // Before the tests start
    before((done: Mocha.Done) => {
        // Wait for the server to come alive
        // @ts-ignore
        socket.on('connect', done);
    });

    // After all of the tests are done
    after(() => {
        socket.disconnect();
    });

    // Order: noAccount, general, account
    const tests = { ...noAccountTests, ...generalTests, ...accountTests };

    // Done is filled in every test
    const testArguments: Partial<TestArguments> = {
        socket,
    };

    for (const test in tests) {
        it(test, (done) => {
            testArguments.done = done;

            tests[test](testArguments);

            if (
                Object.keys(tests).length - 1 ==
                Object.keys(tests).indexOf(test)
            ) {
                postTests();
            }
        });
    }
});
