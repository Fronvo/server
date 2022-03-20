// ******************** //
// Events which are only usable while not logged in.
// ******************** //

import register from './noAccount/register';
import login from './noAccount/login';
import loginToken from './noAccount/loginToken';

export default { register, login, loginToken }
