// ******************** //
// Shared variables for the test files.
// ******************** //

import { SharedVariables } from 'interfaces/test';
import { v4 } from 'uuid';

const email = v4().replace(/-/g, '') + '@gmail.com';
const password = email.substring(0, 30);
let token: string;
let profileId: string;

const sharedVariables: SharedVariables = {
    email,
    password,
    token,
    profileId
};

export default sharedVariables;
