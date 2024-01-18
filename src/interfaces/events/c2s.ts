// ******************** //
// Interfaces for the client to server events of Socket.IO
// ******************** //

import {
    DeleteMessageParams,
    DeleteMessageTestResult,
} from 'interfaces/account/deleteMessage';
import {
    FetchMessagesParams,
    FetchMessagesTestResult,
} from 'interfaces/account/fetchMessages';
import {
    FetchProfileDataParams,
    FetchProfileDataTestResult,
} from 'interfaces/account/fetchProfileData';
import { FetchProfileIdTestResult } from 'interfaces/account/fetchProfileId';
import { LogoutTestResult } from 'interfaces/account/logout';
import {
    SendMessageParams,
    SendMessageTestResult,
} from 'interfaces/account/sendMessage';
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
    ResetPasswordVerifyParams,
    ResetPasswordVerifyTestResult,
} from 'interfaces/noAccount/resetPasswordVerify';
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
    CreateDMParams,
    CreateDMTestResult,
} from 'interfaces/account/createDM';
import {
    SendImageParams,
    SendImageTestResult,
} from 'interfaces/account/sendImage';
import {
    FetchDashboardParams,
    FetchDashboardTestResult,
} from 'interfaces/account/fetchDashboard';
import {
    FetchProfilePostsParams,
    FetchProfilePostsTestResult,
} from 'interfaces/account/fetchProfilePosts';
import { CloseDMParams, CloseDMTestResult } from 'interfaces/account/closeDM';
import {
    LikePostParams,
    LikePostTestResult,
} from 'interfaces/account/likePost';
import { RequestDataTestResult } from 'interfaces/account/requestData';
import {
    DeleteAccountParams,
    DeleteAccountTestResult,
} from 'interfaces/account/deleteAccount';
import {
    SharePostParams,
    SharePostTestResult,
} from 'interfaces/account/sharePost';
import {
    DeletePostParams,
    DeletePostTestResult,
} from 'interfaces/account/deletePost';
import {
    FetchTenorParams,
    FetchTenorTestResult,
} from 'interfaces/account/fetchTenor';
import {
    ApplyProParams,
    ApplyProTestResult,
} from 'interfaces/account/applyPro';
import {
    RefundProParams,
    RefundProTestResult,
} from 'interfaces/account/refundPro';
import {
    FetchPROCHParams,
    FetchPROCHTestResult,
} from 'interfaces/account/fetchPROCH';
import {
    FetchLatestVersionParams,
    FetchLatestVersionTestResult,
} from 'interfaces/account/fetchLatestVersion';
import {
    RemoveFCMParams,
    RemoveFCMTestResult,
} from 'interfaces/account/removeFCM';
import {
    CreateServerParams,
    CreateServerTestResult,
} from 'interfaces/account/createServer';
import {
    DeleteServerParams,
    DeleteServerTestResult,
} from 'interfaces/account/deleteServer';
import {
    FetchServersParams,
    FetchServersTestResult,
} from 'interfaces/account/fetchServers';
import {
    CreateChannelParams,
    CreateChannelTestResult,
} from 'interfaces/account/createChannel';
import {
    DeleteChannelParams,
    DeleteChannelTestResult,
} from 'interfaces/account/deleteChannel';
import {
    FetchChannelMessagesParams,
    FetchChannelMessagesTestResult,
} from 'interfaces/account/fetchChannelMessages';
import {
    SendChannelMessageParams,
    SendChannelMessageTestResult,
} from 'interfaces/account/sendChannelMessage';
import { SendChannelImageParams, SendChannelImageTestResult } from 'interfaces/account/sendChannelImage';

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
    updateProfileData: (
        {}: UpdateProfileDataParams,
        callback?: ({}: UpdateProfileDataTestResult) => void
    ) => void;
    sendMessage: (
        {}: SendMessageParams,
        callback?: ({}: SendMessageTestResult) => void
    ) => void;
    fetchMessages: (
        {}: FetchMessagesParams,
        callback?: ({}: FetchMessagesTestResult) => void
    ) => void;
    deleteMessage: (
        {}: DeleteMessageParams,
        callback?: ({}: DeleteMessageTestResult) => void
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
    createDM: (
        {}: CreateDMParams,
        callback?: ({}: CreateDMTestResult) => void
    ) => void;
    sendImage: (
        {}: SendImageParams,
        callback?: ({}: SendImageTestResult) => void
    ) => void;
    fetchDashboard: (
        {}: FetchDashboardParams,
        callback?: ({}: FetchDashboardTestResult) => void
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
    requestData: (callback?: ({}: RequestDataTestResult) => void) => void;
    deleteAccount: (
        {}: DeleteAccountParams,
        callback?: ({}: DeleteAccountTestResult) => void
    ) => void;
    sharePost: (
        {}: SharePostParams,
        callback?: ({}: SharePostTestResult) => void
    ) => void;
    deletePost: (
        {}: DeletePostParams,
        callback?: ({}: DeletePostTestResult) => void
    ) => void;
    fetchTenor: (
        {}: FetchTenorParams,
        callback?: ({}: FetchTenorTestResult) => void
    ) => void;
    applyPro: (
        {}: ApplyProParams,
        callback?: ({}: ApplyProTestResult) => void
    ) => void;
    refundPro: (
        {}: RefundProParams,
        callback?: ({}: RefundProTestResult) => void
    ) => void;
    fetchPROCH: (
        {}: FetchPROCHParams,
        callback?: ({}: FetchPROCHTestResult) => void
    ) => void;
    fetchLatestVersion: (
        {}: FetchLatestVersionParams,
        callback?: ({}: FetchLatestVersionTestResult) => void
    ) => void;
    removeFCM: (
        {}: RemoveFCMParams,
        callback?: ({}: RemoveFCMTestResult) => void
    ) => void;
    createServer: (
        {}: CreateServerParams,
        callback?: ({}: CreateServerTestResult) => void
    ) => void;
    deleteServer: (
        {}: DeleteServerParams,
        callback?: ({}: DeleteServerTestResult) => void
    ) => void;
    fetchServers: (
        {}: FetchServersParams,
        callback?: ({}: FetchServersTestResult) => void
    ) => void;
    createChannel: (
        {}: CreateChannelParams,
        callback?: ({}: CreateChannelTestResult) => void
    ) => void;
    deleteChannel: (
        {}: DeleteChannelParams,
        callback?: ({}: DeleteChannelTestResult) => void
    ) => void;
    fetchChannelMessages: (
        {}: FetchChannelMessagesParams,
        callback?: ({}: FetchChannelMessagesTestResult) => void
    ) => void;
    sendChannelMessage: (
        {}: SendChannelMessageParams,
        callback?: ({}: SendChannelMessageTestResult) => void
    ) => void;
    sendChannelImage: (
        {}: SendChannelImageParams,
        callback?: ({}: SendChannelImageTestResult) => void
    ) => void;
}
