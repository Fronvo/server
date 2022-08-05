// ******************** //
// Interfaces for the client to server events of Socket.IO
// ******************** //

import {
    CreatePostParams,
    CreatePostTestResult,
} from 'interfaces/account/createPost';
import {
    DeletePostParams,
    DeletePostTestResult,
} from 'interfaces/account/deletePost';
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
    FindProfilesParams,
    FindProfilesTestResult,
} from 'interfaces/account/findProfiles';
import {
    FollowProfileParams,
    FollowProfileTestResult,
} from 'interfaces/account/followProfile';
import { LogoutTestResult } from 'interfaces/account/logout';
import {
    UnfollowProfileParams,
    UnfollowProfileTestResult,
} from 'interfaces/account/unfollowProfile';
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
    findProfiles: (
        {}: FindProfilesParams,
        callback?: ({}: FindProfilesTestResult) => void
    ) => void;
}
