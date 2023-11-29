// ******************** //
// Interfaces for the roomMessage event file.
// ******************** //

import { Account, Message } from '@prisma/client';

export interface NewMessageParams {
    roomId: string;
    newMessageData: {
        message: Partial<Message>;
        profileData: Partial<Account>;
    };
}
