// ******************** //
// Interfaces for the server to client events of Socket.IO
// ******************** //

import { MemberJoinedParams } from 'interfaces/account/memberJoined';
import { MemberLeftParams } from 'interfaces/account/memberLeft';
import { NewRoomMessageParams } from 'interfaces/account/newRoomMessage';
import { OnlineStatusUpdatedParams } from 'interfaces/account/onlineStatusUpdated';
import { RoomMessageDeletedParams } from 'interfaces/account/roomMessageDeleted';
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

    newRoomMessage: ({}: NewRoomMessageParams) => void;

    roomMessageDeleted: ({}: RoomMessageDeletedParams) => void;

    roomDeleted: () => void;

    memberJoined: ({}: MemberJoinedParams) => void;

    memberLeft: ({}: MemberLeftParams) => void;

    onlineStatusUpdated: ({}: OnlineStatusUpdatedParams) => void;
}
