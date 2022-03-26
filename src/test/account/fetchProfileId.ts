// ******************** //
// The test file for the fetchProfileId event.
// ******************** //

import { TestArguments } from 'interfaces/test';
import shared from 'test/shared';

export default ({ socket, done, assert }: TestArguments): void => {

    socket.emit('fetchProfileId', ({ err, profileId }): void => {
        assert(!err);
        assert(typeof profileId == 'string');

        shared.profileId = profileId;
        
        done();
    });

}
