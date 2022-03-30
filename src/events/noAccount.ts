// ******************** //
// Events which are only usable while not logged in.
// ******************** //

import register from 'events/noAccount/register';
import login from 'events/noAccount/login';
import loginToken from 'events/noAccount/loginToken';

import { EventExportTemplate } from 'interfaces/all';

const noAccountTemplate: EventExportTemplate = {
    register,
    login,
    loginToken
}

export default noAccountTemplate;
