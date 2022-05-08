// ******************** //
// The updateRateLimitUnauthorised inter-server event file.
// ******************** //

import { InterUpdateRateLimitUnauthorised } from 'interfaces/events/inter';
import { rateLimiterUnauthorised } from 'other/variables';

export default function updateRateLimitUnauthorised({
    socketIP,
    pointsToConsume,
}: InterUpdateRateLimitUnauthorised): void {
    rateLimiterUnauthorised
        .consumePoints(socketIP, pointsToConsume)
        .catch(() => {});
}
