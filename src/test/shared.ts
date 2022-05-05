// ******************** //
// Shared variables for the test files.
// ******************** //

import { SharedVariables } from 'interfaces/test';
import { generateEmail, generatePassword } from 'test/utilities';

const email = generateEmail();
const password = generatePassword();
let token: string;
let profileId: string;

const shared: SharedVariables = {
    email,
    password,
    token,
    profileId,
};

export default shared;
