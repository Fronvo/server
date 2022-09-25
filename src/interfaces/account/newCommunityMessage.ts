// ******************** //
// Interfaces for the newCommunityMessage event file.
// ******************** //

import { CommunityMessage } from '@prisma/client';

export interface NewCommunityMessageParams {
    newMessageData: CommunityMessage;
}
