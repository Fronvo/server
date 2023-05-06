// ******************** //
// Interfaces for the client to server events of Socket.IO
// ******************** //

import {
    CreateCommunityParams,
    CreateCommunityTestResult,
} from 'interfaces/account/createCommunity';
import {
    CreatePostParams,
    CreatePostTestResult,
} from 'interfaces/account/createPost';
import {
    DeleteCommunityMessageParams,
    DeleteCommunityMessageTestResult,
} from 'interfaces/account/deleteCommunityMessage';
import {
    DeletePostParams,
    DeletePostTestResult,
} from 'interfaces/account/deletePost';
import {
    FetchCommunityDataParams,
    FetchCommunityDataTestResult,
} from 'interfaces/account/fetchCommunityData';
import {
    FetchCommunityMessagesParams,
    FetchCommunityMessagesTestResult,
} from 'interfaces/account/fetchCommunityMessages';
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
    JoinCommunityParams,
    JoinCommunityTestResult,
} from 'interfaces/account/joinCommunity';
import { LeaveCommunityTestResult } from 'interfaces/account/leaveCommunity';
import { LogoutTestResult } from 'interfaces/account/logout';
import {
    SendCommunityMessageParams,
    SendCommunityMessageTestResult,
} from 'interfaces/account/sendCommunityMessage';
import {
    UnfollowProfileParams,
    UnfollowProfileTestResult,
} from 'interfaces/account/unfollowProfile';
import {
    UpdateCommunityDataParams,
    UpdateCommunityDataTestResult,
} from 'interfaces/account/updateCommunityData';
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
    createCommunity: (
        {}: CreateCommunityParams,
        callback?: ({}: CreateCommunityTestResult) => void
    ) => void;
    joinCommunity: (
        {}: JoinCommunityParams,
        callback?: ({}: JoinCommunityTestResult) => void
    ) => void;
    fetchCommunityData: (
        {}: FetchCommunityDataParams,
        callback?: ({}: FetchCommunityDataTestResult) => void
    ) => void;
    updateCommunityData: (
        {}: UpdateCommunityDataParams,
        callback?: ({}: UpdateCommunityDataTestResult) => void
    ) => void;
    leaveCommunity: (callback?: ({}: LeaveCommunityTestResult) => void) => void;
    sendCommunityMessage: (
        {}: SendCommunityMessageParams,
        callback?: ({}: SendCommunityMessageTestResult) => void
    ) => void;
    fetchCommunityMessages: (
        {}: FetchCommunityMessagesParams,
        callback?: ({}: FetchCommunityMessagesTestResult) => void
    ) => void;
    deleteCommunityMessage: (
        {}: DeleteCommunityMessageParams,
        callback?: ({}: DeleteCommunityMessageTestResult) => void
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
