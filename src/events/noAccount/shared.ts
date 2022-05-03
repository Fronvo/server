// ******************** //
// Shared variables for the no-account-only event files.
// ******************** //

import { StringSchema } from '@ezier/validate';

// register / login
export const accountSchema = new StringSchema({
    email: {
        minLength: 8,
        maxLength: 60,
        type: 'email'
    },

    password: {
        minLength: 8,
        maxLength: 30,
        regex: /^[a-zA-Z0-9]+$/
    }
});
