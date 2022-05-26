// ******************** //
// The logoutSocket inter-server event file.
// ******************** //

import { InterLogoutSocket } from 'interfaces/events/inter';
import * as variables from 'variables/global';
import { getSocketAccountId, isAccountLoggedIn } from 'utilities/global';

export default function logoutSocket({ socketId }: InterLogoutSocket): void {
    const accountId = getSocketAccountId(socketId);

    delete variables.loggedInSockets[socketId];

    // Noone is logged in, remove ratelimit
    if (!isAccountLoggedIn(accountId)) {
        variables.rateLimiter.clearRateLimit(accountId, true);
    }
}
