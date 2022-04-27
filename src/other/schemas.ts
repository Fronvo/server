// ******************** //
// Schemas for validating user-provided data.
// ******************** //

import { StringSchema } from '@ezier/validate';

// Register / Login
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

// Login with token
export const accountTokenSchema = new StringSchema({
    token: {
        // Needed for error codes
        length: 36,
        
        type: 'uuid'
    }
});
