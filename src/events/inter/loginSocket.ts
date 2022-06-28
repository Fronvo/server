// ******************** //
// The loginSocket inter-server event file.
// ******************** //

import { InterLoginSocket } from 'interfaces/events/inter';
import * as variables from 'variables/global';

export default function loginSocket({
    socketId,
    accountId,
}: InterLoginSocket): void {
    variables.loggedInSockets[socketId] = { accountId };
}
