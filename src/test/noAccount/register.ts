// ******************** //
// The test file for the register event.
// ******************** //

import { TestArguments } from 'interfaces/test';

export default ({ socket, done, assert, shared }: TestArguments): void => {
    const email = shared.email;
    const password = shared.password;
    
    socket.emit('logout');

    socket.emit('register', { email, password }, ({ err, token }): void => {
        assert(!err);
        assert(typeof token == 'string');

        done();
    });
}
