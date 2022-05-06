// ******************** //
// The inter-server dispatcher file which handles inter-server event requests.
// ******************** //

import interEvents from 'events/inter';
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { InterServerEvents } from 'interfaces/events/inter';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server } from 'socket.io';

export default function interDispatch(
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>
): void {
    for (const interEventIndex in interEvents) {
        const interEvent = interEvents[interEventIndex];

        // Gotta figure out dynamic event registration types at some time
        // @ts-ignore
        io.on(interEventIndex, interEvent);
    }
}
