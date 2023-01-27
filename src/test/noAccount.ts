// ******************** //
// The no-account-only function tests for the Fronvo server.
// ******************** //

// Put all of the event test files here
import register from 'test/noAccount/register.test';
import login from 'test/noAccount/login.test';
import loginToken from 'test/noAccount/loginToken.test';
import resetPassword from 'test/noAccount/resetPassword.test';
import fetchHomePostsGuest from 'test/noAccount/fetchHomePostsGuest.test';

export default {
    fetchHomePostsGuest,
    register,
    login,
    loginToken,
    resetPassword,
};
