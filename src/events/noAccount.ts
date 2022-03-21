// ******************** //
// Events which are only usable while not logged in.
// ******************** //

import register from './noAccount/register/register';
import login from './noAccount/login/login';
import loginToken from './noAccount/loginToken/loginToken';

export default { register, login, loginToken }
