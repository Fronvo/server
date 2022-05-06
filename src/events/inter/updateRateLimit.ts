// ******************** //
// The updateRateLimit inter-server event file.
// ******************** //

import { InterUpdateRateLimit } from 'interfaces/events/inter';
import { rateLimiter } from 'other/variables';

export default function updateRateLimit({
    socketIP,
    pointsToConsume,
}: InterUpdateRateLimit): void {
    rateLimiter.consumePoints(socketIP, pointsToConsume).catch(() => {});
}
