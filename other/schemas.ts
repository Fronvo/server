// ******************** //
// Schemas made with Joi for validating user data.
// ******************** //

import Joi from 'joi';

// Register / Login
export const accountSchema = Joi.object({
    email: Joi.string().email().min(8).max(60).required(),
    password: Joi.string().regex(/[a-zA-Z0-9]/).min(8).max(30).required()
});

// Login with token
export const accountTokenSchema = Joi.object({
    token: Joi.string().length(36).regex(/[a-z0-9-]/).required()
});
