// ******************** //
// Interfaces for the newRoomMessage event file.
// ******************** //

import { Account, RoomMessage } from '@prisma/client';

export interface NewRoomMessageParams {
    newMessageData: {
        message: Partial<RoomMessage>;
        profileData: Partial<Account>;
    };
}
