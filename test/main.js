// ******************** //
// The starting point of the Fronvo server's tests.
// ******************** //

// Variables
const PORT = process.env.PORT || 3001;

// Test files
const generalTests = require('./general');
const accountTests = require('./account');
const noAccountTests = require('./noAccount');

// Mocha
const { assert } = require('chai');

// Other
const { io } = require('socket.io-client');
const shared = require('./shared');

// Create the client
socket = io(`ws://localhost:${PORT}`, {
	transports: ['websocket'],
	path: '/fronvo',
	reconnectionDelay: 100,
	reconnectionDelayMax: 200,
	reconnectionAttempts: 10,
	randomizationFactor: 0
});

describe('Fronvo', () => {
	let socket;
	
	// Before the tests start
	before((done) => {
		// Wait for the server to come alive
		socket.on('connect', done);
	});

	// After all of the tests are done
	after(() => {
		socket.disconnect();
	});

	// DYNAMIC TESTS AREA

	// Order: noAccount, general, account
	const tests = {...noAccountTests, ...generalTests, ...accountTests};

	for(const test in tests) {
		it(test, (done) => {
			tests[test]({ socket, done, assert, shared });
		});
	}

});
