// ******************** //
// The test file for the loginToken event.
// ******************** //

import { TestArguments } from 'interfaces/test';

export default ({ socket, done, assert, shared }: TestArguments): void => {
    const token = shared.token;

    socket.emit('logout');

    socket.emit('loginToken', { token }, ({ err }): void => {
        assert(!err);
        
        done();
    });
}
