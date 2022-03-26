// ******************** //
// Interfaces for the client to server events of Socket.IO
// ******************** //

import { FetchProfileDataParams, FetchProfileDataTestResult } from 'interfaces/account/fetchProfileData';
import { FetchProfileIdTestResult } from 'interfaces/account/fetchProfileId';
import { LogoutTestResult } from 'interfaces/account/logout';
import { IsLoggedInTestResult } from 'interfaces/general/isLoggedIn';
import { LoginParams, LoginTestResult } from 'interfaces/noAccount/login';
import { LoginTokenParams, LoginTokenTestResult } from 'interfaces/noAccount/loginToken';
import { RegisterParams, RegisterTestResult } from 'interfaces/noAccount/register';

export interface ClientToServerEvents {
    register: ({ email, password }: RegisterParams, callback?: ({}: RegisterTestResult) => void) => void;
    login: ({ email, password }: LoginParams, callback?: ({}: LoginTestResult) => void) => void;
    loginToken: ({ token }: LoginTokenParams, callback?: ({}: LoginTokenTestResult) => void) => void;
    isLoggedIn: (callback?: ({}: IsLoggedInTestResult) => void) => void;
    fetchProfileId: (callback?: ({}: FetchProfileIdTestResult) => void) => void;
    fetchProfileData: ({ profileId }: FetchProfileDataParams, callback?: ({}: FetchProfileDataTestResult) => void) => void;
    logout: (callback?: ({}: LogoutTestResult) => void) => void;
}
