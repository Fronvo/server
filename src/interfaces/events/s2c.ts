// ******************** //
// Interfaces for the server to client events of Socket.IO
// ******************** //

import { FriendAddedParams } from 'interfaces/account/friendAdded';
import { FriendRemovedParams } from 'interfaces/account/friendRemoved';
import { MemberJoinedParams } from 'interfaces/account/memberJoined';
import { MemberLeftParams } from 'interfaces/account/memberLeft';
import { NewFriendRequestParams } from 'interfaces/account/newFriendRequest';
import { NewMessageParams } from 'interfaces/account/newMessage';
import { OnlineStatusUpdatedParams } from 'interfaces/account/onlineStatusUpdated';
import { PendingFriendRemovedParams } from 'interfaces/account/pendingFriendRemoved';
import { PostLikesChangedParams } from 'interfaces/account/postLikesChanged';
import { PostRemovedParams } from 'interfaces/account/postRemoved';
import { PostSharedParams } from 'interfaces/account/postShared';
import { ProfileDataUpdatedParams } from 'interfaces/account/profileDataUpdated';
import { ProfileStatusUpdatedParams } from 'interfaces/account/profileStatusUpdated';
import { RoomAddedParams } from 'interfaces/account/roomAdded';
import { RoomCreatedParams } from 'interfaces/account/roomCreated';
import { RoomDeletedParams } from 'interfaces/account/roomDeleted';
import { MessageDeletedParams } from 'interfaces/account/messageDeleted';
import { RoomRemovedParams } from 'interfaces/account/roomRemoved';
import { ServerCreatedParams } from 'interfaces/account/serverCreated';
import { ServerDeletedParams } from 'interfaces/account/serverDeleted';
import { TypingEndedParams } from 'interfaces/account/typingEnded';
import { TypingStartedParams } from 'interfaces/account/typingStarted';
import {
    RegisterVerifyParams,
    RegisterVerifyTestResult,
} from 'interfaces/noAccount/registerVerify';

import {
    ResetPasswordVerifyParams,
    ResetPasswordVerifyTestResult,
} from 'interfaces/noAccount/resetPasswordVerify';
import { ChannelCreatedParams } from 'interfaces/account/channelCreated';
import { ChannelDeletedParams } from 'interfaces/account/channelDeleted';

export interface ServerToClientEvents {
    registerVerify: (
        {}: RegisterVerifyParams,
        callback?: ({}: RegisterVerifyTestResult) => void
    ) => void;

    resetPasswordVerify: (
        {}: ResetPasswordVerifyParams,
        callback?: ({}: ResetPasswordVerifyTestResult) => void
    ) => void;

    newMessage: ({}: NewMessageParams) => void;

    roomMessageDeleted: ({}: MessageDeletedParams) => void;

    roomCreated: ({}: RoomCreatedParams) => void;

    roomDeleted: ({}: RoomDeletedParams) => void;

    roomAdded: ({}: RoomAddedParams) => void;

    roomRemoved: ({}: RoomRemovedParams) => void;

    memberJoined: ({}: MemberJoinedParams) => void;

    memberLeft: ({}: MemberLeftParams) => void;

    onlineStatusUpdated: ({}: OnlineStatusUpdatedParams) => void;

    profileDataUpdated: ({}: ProfileDataUpdatedParams) => void;

    typingStarted: ({}: TypingStartedParams) => void;

    typingEnded: ({}: TypingEndedParams) => void;

    newFriendRequest: ({}: NewFriendRequestParams) => void;

    friendAdded: ({}: FriendAddedParams) => void;

    friendRemoved: ({}: FriendRemovedParams) => void;

    profileStatusUpdated: ({}: ProfileStatusUpdatedParams) => void;

    pendingFriendRemoved: ({}: PendingFriendRemovedParams) => void;

    postLikesChanged: ({}: PostLikesChangedParams) => void;

    postShared: ({}: PostSharedParams) => void;

    postRemoved: ({}: PostRemovedParams) => void;

    serverCreated: ({}: ServerCreatedParams) => void;

    serverDeleted: ({}: ServerDeletedParams) => void;

    channelCreated: ({}: ChannelCreatedParams) => void;

    channelDeleted: ({}: ChannelDeletedParams) => void;
}
