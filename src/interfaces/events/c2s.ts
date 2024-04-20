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
import {
    SendChannelImageParams,
    SendChannelImageTestResult,
} from 'interfaces/account/sendChannelImage';
import {
    JoinServerParams,
    JoinServerTestResult,
} from 'interfaces/account/joinServer';
import {
    ToggleServerInvitesParams,
    ToggleServerInvitesTestResult,
} from 'interfaces/account/toggleServerInvites';
import {
    RegenerateServerInviteParams,
    RegenerateServerInviteTestResult,
} from 'interfaces/account/regenerateServerInvite';
import {
    ApplyTurboParams,
    ApplyTurboTestResult,
} from 'interfaces/account/applyTurbo';
import {
    RefundTurboParams,
    RefundTurboTestResult,
} from 'interfaces/account/refundTurbo';
import {
    FetchTurboCHParams,
    FetchTurboCHTestResult,
} from 'interfaces/account/fetchTurboCH';
import {
    DeleteChannelMessageParams,
    DeleteChannelMessageTestResult,
} from 'interfaces/account/deleteChannelMessage';
import {
    RenameChannelParams,
    RenameChannelTestResult,
} from 'interfaces/account/renameChannel';
import {
    SendPostParams,
    SendPostTestResult,
} from 'interfaces/account/sendPost';
import {
    FetchPostParams,
    FetchPostTestResult,
} from 'interfaces/account/fetchPost';
import {
    LeaveServerParams,
    LeaveServerTestResult,
} from 'interfaces/account/leaveServer';
import {
    KickMemberParams,
    KickMemberTestResult,
} from 'interfaces/account/kickMember';
import {
    BanMemberParams,
    BanMemberTestResult,
} from 'interfaces/account/banMember';
import {
    UnbanMemberParams,
    UnbanMemberTestResult,
} from 'interfaces/account/unbanMember';
import {
    UpdateConnectionSpotifyParams,
    UpdateConnectionSpotifyTestResult,
} from 'interfaces/account/updateConnectionSpotify';
import {
    RemoveConnectionSpotifyParams,
    RemoveConnectionSpotifyTestResult,
} from 'interfaces/account/removeConnectionSpotify';
import {
    RemoveConnectionGithubParams,
    RemoveConnectionGithubTestResult,
} from 'interfaces/account/removeConnectionGithub';
import {
    UpdateConnectionGithubParams,
    UpdateConnectionGithubTestResult,
} from 'interfaces/account/updateConnectionGithub';

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
    applyTurbo: (
        {}: ApplyTurboParams,
        callback?: ({}: ApplyTurboTestResult) => void
    ) => void;
    refundTurbo: (
        {}: RefundTurboParams,
        callback?: ({}: RefundTurboTestResult) => void
    ) => void;
    fetchTurboCH: (
        {}: FetchTurboCHParams,
        callback?: ({}: FetchTurboCHTestResult) => void
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
    joinServer: (
        {}: JoinServerParams,
        callback?: ({}: JoinServerTestResult) => void
    ) => void;
    toggleServerInvites: (
        {}: ToggleServerInvitesParams,
        callback?: ({}: ToggleServerInvitesTestResult) => void
    ) => void;
    regenerateServerInvite: (
        {}: RegenerateServerInviteParams,
        callback?: ({}: RegenerateServerInviteTestResult) => void
    ) => void;
    deleteChannelMessage: (
        {}: DeleteChannelMessageParams,
        callback?: ({}: DeleteChannelMessageTestResult) => void
    ) => void;
    renameChannel: (
        {}: RenameChannelParams,
        callback?: ({}: RenameChannelTestResult) => void
    ) => void;
    sendPost: (
        {}: SendPostParams,
        callback?: ({}: SendPostTestResult) => void
    ) => void;
    fetchPost: (
        {}: FetchPostParams,
        callback?: ({}: FetchPostTestResult) => void
    ) => void;
    leaveServer: (
        {}: LeaveServerParams,
        callback?: ({}: LeaveServerTestResult) => void
    ) => void;
    kickMember: (
        {}: KickMemberParams,
        callback?: ({}: KickMemberTestResult) => void
    ) => void;
    banMember: (
        {}: BanMemberParams,
        callback?: ({}: BanMemberTestResult) => void
    ) => void;
    unbanMember: (
        {}: UnbanMemberParams,
        callback?: ({}: UnbanMemberTestResult) => void
    ) => void;
    updateConnectionSpotify: (
        {}: UpdateConnectionSpotifyParams,
        callback?: ({}: UpdateConnectionSpotifyTestResult) => void
    ) => void;
    removeConnectionSpotify: (
        {}: RemoveConnectionSpotifyParams,
        callback?: ({}: RemoveConnectionSpotifyTestResult) => void
    ) => void;
    removeConnectionGithub: (
        {}: RemoveConnectionGithubParams,
        callback?: ({}: RemoveConnectionGithubTestResult) => void
    ) => void;
    updateConnectionGithub: (
        {}: UpdateConnectionGithubParams,
        callback?: ({}: UpdateConnectionGithubTestResult) => void
    ) => void;
}
