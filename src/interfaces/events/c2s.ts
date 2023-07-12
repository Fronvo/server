// ******************** //
// Interfaces for the client to server events of Socket.IO
// ******************** //

import {
    CreateRoomParams,
    CreateRoomTestResult,
} from 'interfaces/account/createRoom';
import {
    DeleteRoomMessageParams,
    DeleteRoomMessageTestResult,
} from 'interfaces/account/deleteRoomMessage';
import {
    FetchRoomMessagesParams,
    FetchRoomMessagesTestResult,
} from 'interfaces/account/fetchRoomMessages';
import {
    FetchProfileDataParams,
    FetchProfileDataTestResult,
} from 'interfaces/account/fetchProfileData';
import { FetchProfileIdTestResult } from 'interfaces/account/fetchProfileId';
import { LeaveRoomTestResult } from 'interfaces/account/leaveRoom';
import { LogoutTestResult } from 'interfaces/account/logout';
import {
    SendRoomMessageParams,
    SendRoomMessageTestResult,
} from 'interfaces/account/sendRoomMessage';
import {
    UpdateRoomDataParams,
    UpdateRoomDataTestResult,
} from 'interfaces/account/updateRoomData';
import {
    UpdateProfileDataParams,
    UpdateProfileDataTestResult,
} from 'interfaces/account/updateProfileData';
import { IsLoggedInTestResult } from 'interfaces/general/isLoggedIn';
import { LoginParams, LoginTestResult } from 'interfaces/noAccount/login';
import {
    LoginTokenParams,
    LoginTokenTestResult,
} from 'interfaces/noAccount/loginToken';
import {
    RegisterParams,
    RegisterTestResult,
} from 'interfaces/noAccount/register';
import {
    RegisterVerifyParams,
    RegisterVerifyTestResult,
} from 'interfaces/noAccount/registerVerify';
import {
    ResetPasswordParams,
    ResetPasswordTestResult,
} from 'interfaces/noAccount/resetPassword';
import {
    ResetPasswordFinalParams,
    ResetPasswordFinalTestResult,
} from 'interfaces/noAccount/resetPasswordFinal';
import {
    ResetPasswordVerifyParams,
    ResetPasswordVerifyTestResult,
} from 'interfaces/noAccount/resetPasswordVerify';
import {
    KickMemberParams,
    KickMemberTestResult,
} from 'interfaces/account/kickMember';
import {
    UpdateProfileStatusParams,
    UpdateProfileStatusTestResult,
} from 'interfaces/account/updateProfileStatus';
import {
    FetchConvosParams,
    FetchConvosTestResult,
} from 'interfaces/account/fetchConvos';
import {
    StartTypingParams,
    StartTypingTestResult,
} from 'interfaces/account/startTyping';
import {
    FinishTypingParams,
    FinishTypingTestResult,
} from 'interfaces/account/finishTyping';
import {
    AddFriendParams,
    AddFriendTestResult,
} from 'interfaces/account/addFriend';
import {
    RemoveFriendParams,
    RemoveFriendTestResult,
} from 'interfaces/account/removeFriend';
import {
    AcceptFriendRequestParams,
    AcceptFriendRequestTestResult,
} from 'interfaces/account/acceptFriendRequest';
import {
    RejectFriendRequestParams,
    RejectFriendRequestTestResult,
} from 'interfaces/account/rejectFriendRequest';
import {
    AddRoomMemberParams,
    AddRoomMemberTestResult,
} from 'interfaces/account/addRoomMember';
import {
    RemoveRoomMemberParams,
    RemoveRoomMemberTestResult,
} from 'interfaces/account/removeRoomMember';
import {
    CreateDMParams,
    CreateDMTestResult,
} from 'interfaces/account/createDM';
import {
    SendRoomImageParams,
    SendRoomImageTestResult,
} from 'interfaces/account/sendRoomImage';
import {
    FetchHomePostsParams,
    FetchHomePostsTestResult,
} from 'interfaces/account/fetchHomePosts';
import {
    FetchProfilePostsParams,
    FetchProfilePostsTestResult,
} from 'interfaces/account/fetchProfilePosts';
import { CloseDMParams, CloseDMTestResult } from 'interfaces/account/closeDM';
import {
    LikePostParams,
    LikePostTestResult,
} from 'interfaces/account/likePost';

export interface ClientToServerEvents {
    register: (
        {}: RegisterParams,
        callback?: ({}: RegisterTestResult) => void
    ) => void;
    registerVerify: (
        {}: RegisterVerifyParams,
        callback?: ({}: RegisterVerifyTestResult) => void
    ) => void;
    login: ({}: LoginParams, callback?: ({}: LoginTestResult) => void) => void;
    loginToken: (
        {}: LoginTokenParams,
        callback?: ({}: LoginTokenTestResult) => void
    ) => void;
    isLoggedIn: (callback?: ({}: IsLoggedInTestResult) => void) => void;
    fetchProfileId: (callback?: ({}: FetchProfileIdTestResult) => void) => void;
    fetchProfileData: (
        {}: FetchProfileDataParams,
        callback?: ({}: FetchProfileDataTestResult) => void
    ) => void;
    logout: (callback?: ({}: LogoutTestResult) => void) => void;
    resetPassword: (
        {}: ResetPasswordParams,
        callback?: ({}: ResetPasswordTestResult) => void
    ) => void;
    resetPasswordVerify: (
        {}: ResetPasswordVerifyParams,
        callback?: ({}: ResetPasswordVerifyTestResult) => void
    ) => void;
    resetPasswordFinal: (
        {}: ResetPasswordFinalParams,
        callback?: ({}: ResetPasswordFinalTestResult) => void
    ) => void;
    updateProfileData: (
        {}: UpdateProfileDataParams,
        callback?: ({}: UpdateProfileDataTestResult) => void
    ) => void;
    createRoom: (
        {}: CreateRoomParams,
        callback?: ({}: CreateRoomTestResult) => void
    ) => void;
    updateRoomData: (
        {}: UpdateRoomDataParams,
        callback?: ({}: UpdateRoomDataTestResult) => void
    ) => void;
    leaveRoom: (callback?: ({}: LeaveRoomTestResult) => void) => void;
    sendRoomMessage: (
        {}: SendRoomMessageParams,
        callback?: ({}: SendRoomMessageTestResult) => void
    ) => void;
    fetchRoomMessages: (
        {}: FetchRoomMessagesParams,
        callback?: ({}: FetchRoomMessagesTestResult) => void
    ) => void;
    deleteRoomMessage: (
        {}: DeleteRoomMessageParams,
        callback?: ({}: DeleteRoomMessageTestResult) => void
    ) => void;
    kickMember: (
        {}: KickMemberParams,
        callback?: ({}: KickMemberTestResult) => void
    ) => void;
    updateProfileStatus: (
        {}: UpdateProfileStatusParams,
        callback?: ({}: UpdateProfileStatusTestResult) => void
    ) => void;
    fetchConvos: (
        {}: FetchConvosParams,
        callback?: ({}: FetchConvosTestResult) => void
    ) => void;
    startTyping: (
        {}: StartTypingParams,
        callback?: ({}: StartTypingTestResult) => void
    ) => void;
    finishTyping: (
        {}: FinishTypingParams,
        callback?: ({}: FinishTypingTestResult) => void
    ) => void;
    addFriend: (
        {}: AddFriendParams,
        callback?: ({}: AddFriendTestResult) => void
    ) => void;
    removeFriend: (
        {}: RemoveFriendParams,
        callback?: ({}: RemoveFriendTestResult) => void
    ) => void;
    acceptFriendRequest: (
        {}: AcceptFriendRequestParams,
        callback?: ({}: AcceptFriendRequestTestResult) => void
    ) => void;
    rejectFriendRequest: (
        {}: RejectFriendRequestParams,
        callback?: ({}: RejectFriendRequestTestResult) => void
    ) => void;
    addRoomMember: (
        {}: AddRoomMemberParams,
        callback?: ({}: AddRoomMemberTestResult) => void
    ) => void;
    removeRoomMember: (
        {}: RemoveRoomMemberParams,
        callback?: ({}: RemoveRoomMemberTestResult) => void
    ) => void;
    createDM: (
        {}: CreateDMParams,
        callback?: ({}: CreateDMTestResult) => void
    ) => void;
    sendRoomImage: (
        {}: SendRoomImageParams,
        callback?: ({}: SendRoomImageTestResult) => void
    ) => void;
    fetchHomePosts: (
        {}: FetchHomePostsParams,
        callback?: ({}: FetchHomePostsTestResult) => void
    ) => void;
    fetchProfilePosts: (
        {}: FetchProfilePostsParams,
        callback?: ({}: FetchProfilePostsTestResult) => void
    ) => void;
    closeDM: (
        {}: CloseDMParams,
        callback?: ({}: CloseDMTestResult) => void
    ) => void;
    likePost: (
        {}: LikePostParams,
        callback?: ({}: LikePostTestResult) => void
    ) => void;
}
