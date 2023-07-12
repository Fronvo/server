// ******************** //
// Interfaces for the server to client events of Socket.IO
// ******************** //

import { FriendAddedParams } from 'interfaces/account/friendAdded';
import { FriendRemovedParams } from 'interfaces/account/friendRemoved';
import { MemberJoinedParams } from 'interfaces/account/memberJoined';
import { MemberLeftParams } from 'interfaces/account/memberLeft';
import { NewFriendRequestParams } from 'interfaces/account/newFriendRequest';
import { NewRoomMessageParams } from 'interfaces/account/newRoomMessage';
import { OnlineStatusUpdatedParams } from 'interfaces/account/onlineStatusUpdated';
import { PendingFriendRemovedParams } from 'interfaces/account/pendingFriendRemoved';
import { PostLikesChangedParams } from 'interfaces/account/postLikesChanged';
import { ProfileDataUpdatedParams } from 'interfaces/account/profileDataUpdated';
import { ProfileStatusUpdatedParams } from 'interfaces/account/profileStatusUpdated';
import { RoomAddedParams } from 'interfaces/account/roomAdded';
import { RoomCreatedParams } from 'interfaces/account/roomCreated';
import { RoomDataUpdatedParams } from 'interfaces/account/roomDataUpdated';
import { RoomDeletedParams } from 'interfaces/account/roomDeleted';
import { RoomMessageDeletedParams } from 'interfaces/account/roomMessageDeleted';
import { RoomRemovedParams } from 'interfaces/account/roomRemoved';
import { TypingEndedParams } from 'interfaces/account/typingEnded';
import { TypingStartedParams } from 'interfaces/account/typingStarted';
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

    roomCreated: ({}: RoomCreatedParams) => void;

    roomDeleted: ({}: RoomDeletedParams) => void;

    roomAdded: ({}: RoomAddedParams) => void;

    roomRemoved: ({}: RoomRemovedParams) => void;

    memberJoined: ({}: MemberJoinedParams) => void;

    memberLeft: ({}: MemberLeftParams) => void;

    onlineStatusUpdated: ({}: OnlineStatusUpdatedParams) => void;

    roomDataUpdated: ({}: RoomDataUpdatedParams) => void;

    profileDataUpdated: ({}: ProfileDataUpdatedParams) => void;

    typingStarted: ({}: TypingStartedParams) => void;

    typingEnded: ({}: TypingEndedParams) => void;

    newFriendRequest: ({}: NewFriendRequestParams) => void;

    friendAdded: ({}: FriendAddedParams) => void;

    friendRemoved: ({}: FriendRemovedParams) => void;

    profileStatusUpdated: ({}: ProfileStatusUpdatedParams) => void;

    pendingFriendRemoved: ({}: PendingFriendRemovedParams) => void;

    postLikesChanged: ({}: PostLikesChangedParams) => void;
}
