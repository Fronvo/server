// ******************** //
// The test file for the isLoggedIn event.
// ******************** //

import { TestArguments } from 'interfaces/test';

export default ({ socket, done, assert }: TestArguments): void => {
    socket.emit('isLoggedIn', ({ err, loggedIn }): void => {
        assert(!err);
        assert(typeof(loggedIn) == 'boolean');
        
        done();
    });
}
