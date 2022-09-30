// ******************** //
// Interfaces for the server to client events of Socket.IO
// ******************** //

import { ChatRequestUpdatedParams } from 'interfaces/account/chatRequestUpdated';
import { CommunityMessageDeletedParams } from 'interfaces/account/communityMessageDeleted';
import { NewCommunityMessageParams } from 'interfaces/account/newCommunityMessage';
import {
    RegisterVerifyParams,
    RegisterVerifyTestResult,
} from 'interfaces/noAccount/registerVerify';
import {
    ResetPasswordFinalParams,
    ResetPasswordFinalTestResult,
} from 'interfaces/noAccount/resetPasswordFinal';
import {
    ResetPasswordVerifyParams,
    ResetPasswordVerifyTestResult,
} from 'interfaces/noAccount/resetPasswordVerify';

export interface ServerToClientEvents {
    registerVerify: (
        {}: RegisterVerifyParams,
        callback?: ({}: RegisterVerifyTestResult) => void
    ) => void;
    resetPasswordVerify: (
        {}: ResetPasswordVerifyParams,
        callback?: ({}: ResetPasswordVerifyTestResult) => void
    ) => void;

    resetPasswordFinal: (
        {}: ResetPasswordFinalParams,
        callback?: ({}: ResetPasswordFinalTestResult) => void
    ) => void;

    newCommunityMessage: ({}: NewCommunityMessageParams) => void;

    communityMessageDeleted: ({}: CommunityMessageDeletedParams) => void;

    communityDeleted: () => void;

    chatRequestUpdated: ({}: ChatRequestUpdatedParams) => void;
}
