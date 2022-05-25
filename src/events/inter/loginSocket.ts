// ******************** //
// The loginSocket inter-server event file.
// ******************** //

import { InterLoginSocket } from 'interfaces/events/inter';
import * as variables from 'variables/global';

export default function loginSocket({
    socketId,
    socketIP,
    accountId,
}: InterLoginSocket): void {
    variables.loggedInSockets[socketId] = { accountId };

    // Add accountId to ratelimits if not present
    if (!variables.rateLimiter.getRateLimit(accountId)) {
        variables.rateLimiter.createRateLimit(accountId);
    }

    variables.rateLimiterUnauthorised.clearRateLimit(socketIP, true);
}
