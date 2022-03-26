// ******************** //
// The test file for the login event.
// ******************** //

import { TestArguments } from 'interfaces/test';
import shared from 'test/shared';

export default ({ socket, done, assert }: TestArguments): void => {
    const email = shared.email;
    const password = shared.password;
    
    socket.emit('logout');

    socket.emit('login', { email, password }, ({ err, token }): void => {
        assert(!err);
        assert(typeof token == 'string');
        
        shared.token = token;
        
        done();
    });
}
