// ******************** //
// The no-account-only function tests for the Fronvo server.
// ******************** //

// Put all of the event test files here
import register from 'test/noAccount/register.test';
import login from 'test/noAccount/login.test';
import loginToken from 'test/noAccount/loginToken.test';
import resetPassword from 'test/noAccount/resetPassword.test';

export default { register, login, loginToken, resetPassword };
