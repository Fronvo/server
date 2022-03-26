// ******************** //
// Events which are only usable while not logged in.
// ******************** //

import register from 'events/noAccount/register';
import login from 'events/noAccount/login';
import loginToken from 'events/noAccount/loginToken';

export default { register, login, loginToken }
