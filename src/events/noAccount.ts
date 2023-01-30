// ******************** //
// Events which are only usable while not logged in.
// ******************** //

import register from 'events/noAccount/register';
import login from 'events/noAccount/login';
import loginToken from 'events/noAccount/loginToken';
import resetPassword from 'events/noAccount/resetPassword';
import fetchHomePostsGuest from 'events/noAccount/fetchHomePostsGuest';
import fetchProfileDataGuest from 'events/noAccount/fetchProfileDataGuest';

import { EventExportTemplate } from 'interfaces/all';

const noAccountTemplate: EventExportTemplate = {
    register,
    login,
    loginToken,
    resetPassword,
    fetchHomePostsGuest,
    fetchProfileDataGuest,
};

export default noAccountTemplate;
