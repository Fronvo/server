// ******************** //
// The test file for the logout event.
// ******************** //

import { TestArguments } from 'interfaces/test';

export default ({ socket, done, assert }: TestArguments): void => {
    socket.emit('logout', ({ err}): void => {
        assert(!err);
        
        done();
    });
}
