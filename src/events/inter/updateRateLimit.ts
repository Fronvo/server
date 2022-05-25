// ******************** //
// The updateRateLimit inter-server event file.
// ******************** //

import { InterUpdateRateLimit } from 'interfaces/events/inter';
import { rateLimiter } from 'variables/global';

export default function updateRateLimit({
    accountId,
    pointsToConsume,
}: InterUpdateRateLimit): void {
    rateLimiter.consumePoints(accountId, pointsToConsume).catch(() => {});
}
