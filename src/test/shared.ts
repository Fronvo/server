// ******************** //
// Shared variables for the test files.
// ******************** //

import { SharedVariables } from 'interfaces/test';
import { generateEmail, generatePassword } from 'test/utilities';

const email = generateEmail();
const password = generatePassword();
let token: string;
let profileId: string;
let secondaryProfileId: string;
let sharedPostId: string;
let createdCommunityId: string;
let createdCommunityName: string;

const shared: SharedVariables = {
    email,
    password,
    token,
    profileId,
    secondaryProfileId,
    sharedPostId,
    createdCommunityId,
    createdCommunityName,
};

export default shared;
