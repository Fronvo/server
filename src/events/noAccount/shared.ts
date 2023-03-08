// ******************** //
// Shared variables for the no-account-only event files.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { emailSchema, passwordSchema } from 'events/shared';

// register / login
export const accountSchema = new StringSchema({
    ...emailSchema,
    ...passwordSchema,
});
