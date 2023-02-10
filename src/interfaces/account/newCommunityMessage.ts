// ******************** //
// Interfaces for the newCommunityMessage event file.
// ******************** //

import { Account, CommunityMessage } from '@prisma/client';

export interface NewCommunityMessageParams {
    newMessageData: {
        message: Partial<CommunityMessage>;
        profileData: Partial<Account>;
    };
}
