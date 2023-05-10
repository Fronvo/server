// ******************** //
// Interfaces for the client to server events of Socket.IO
// ******************** //

import {
    CreateRoomParams,
    CreateRoomTestResult,
} from 'interfaces/account/createRoom';
import {
    CreatePostParams,
    CreatePostTestResult,
} from 'interfaces/account/createPost';
import {
    DeleteRoomMessageParams,
    DeleteRoomMessageTestResult,
} from 'interfaces/account/deleteRoomMessage';
import {
    DeletePostParams,
    DeletePostTestResult,
} from 'interfaces/account/deletePost';
import {
    FetchRoomDataParams,
    FetchRoomDataTestResult,
} from 'interfaces/account/fetchRoomData';
import {
    FetchRoomMessagesParams,
    FetchRoomMessagesTestResult,
} from 'interfaces/account/fetchRoomMessages';
import {
    FetchHomePostsParams,
    FetchHomePostsTestResult,
} from 'interfaces/account/fetchHomePosts';
import {
    FetchProfileDataParams,
    FetchProfileDataTestResult,
} from 'interfaces/account/fetchProfileData';
import { FetchProfileIdTestResult } from 'interfaces/account/fetchProfileId';
import {
    FetchProfilePostsParams,
    FetchProfilePostsTestResult,
} from 'interfaces/account/fetchProfilePosts';
import {
    FollowProfileParams,
    FollowProfileTestResult,
} from 'interfaces/account/followProfile';
import {
    JoinRoomParams,
    JoinRoomTestResult,
} from 'interfaces/account/joinRoom';
import { LeaveRoomTestResult } from 'interfaces/account/leaveRoom';
import { LogoutTestResult } from 'interfaces/account/logout';
import {
    SendRoomMessageParams,
    SendRoomMessageTestResult,
} from 'interfaces/account/sendRoomMessage';
import {
    UnfollowProfileParams,
    UnfollowProfileTestResult,
} from 'interfaces/account/unfollowProfile';
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
    BanMemberParams,
    BanMemberTestResult,
} from 'interfaces/account/banMember';
import { ShowBannedMembersTestResult } from 'interfaces/account/showBannedMembers';
import {
    UnbanMemberParams,
    UnbanMemberTestResult,
} from 'interfaces/account/unbanMember';

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
    createPost: (
        {}: CreatePostParams,
        callback?: ({}: CreatePostTestResult) => void
    ) => void;
    fetchProfilePosts: (
        {}: FetchProfilePostsParams,
        callback?: ({}: FetchProfilePostsTestResult) => void
    ) => void;
    deletePost: (
        {}: DeletePostParams,
        callback?: ({}: DeletePostTestResult) => void
    ) => void;
    followProfile: (
        {}: FollowProfileParams,
        callback?: ({}: FollowProfileTestResult) => void
    ) => void;
    unfollowProfile: (
        {}: UnfollowProfileParams,
        callback?: ({}: UnfollowProfileTestResult) => void
    ) => void;
    fetchHomePosts: (
        {}: FetchHomePostsParams,
        callback?: ({}: FetchHomePostsTestResult) => void
    ) => void;
    createRoom: (
        {}: CreateRoomParams,
        callback?: ({}: CreateRoomTestResult) => void
    ) => void;
    joinRoom: (
        {}: JoinRoomParams,
        callback?: ({}: JoinRoomTestResult) => void
    ) => void;
    fetchRoomData: (
        {}: FetchRoomDataParams,
        callback?: ({}: FetchRoomDataTestResult) => void
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
    banMember: (
        {}: BanMemberParams,
        callback?: ({}: BanMemberTestResult) => void
    ) => void;
    showBannedMembers: (
        callback?: ({}: ShowBannedMembersTestResult) => void
    ) => void;
    unbanMember: (
        {}: UnbanMemberParams,
        callback?: ({}: UnbanMemberTestResult) => void
    ) => void;
}
