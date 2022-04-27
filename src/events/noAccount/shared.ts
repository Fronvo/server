// ******************** //
// Shared variables for the no-account-only event files.
// ******************** //

import { FronvoError } from 'interfaces/all';
import { accountSchema, accountTokenSchema } from 'other/schemas';
import { generateError } from 'utilities/global';

export function decideAccountSchemaResult(email: string, password: string): undefined | FronvoError {
    // Only need the first error
    const result = accountSchema.validate({ email, password })[0];

    if(!result)
        return;

    const key = result.extras.key;
    const extras: {[key: string]: any} = {for: key};

    switch (result.name) {
        case 'STRING_REQUIRED':
            return generateError('REQUIRED', extras, [key]);

        case 'STRING_INVALID_LENGTH':
            return generateError('EXACT_LENGTH', extras, [key]);

        case 'STRING_INVALID_MIN_LENGTH':
        case 'STRING_INVALID_MAX_LENGTH':
            const min = accountSchema.schema[key].minLength;
            const max = accountSchema.schema[key].maxLength;
            
            return generateError('LENGTH', {...extras, min, max}, [key, min, max]);

        case 'STRING_INVALID_TYPE':
            return generateError('INVALID_EMAIL_FORMAT', extras);

        case 'STRING_INVALID_REGEX':
            return generateError('INVALID_REGEX', extras, [key]);

        default:
            return generateError('UNKNOWN');
    }
}

export function decideAccountTokenSchemaResult(token: string): FronvoError {
    const result = accountTokenSchema.validate({ token })[0];

    if (!result)
        return;

    const extras = {for: 'token'};

    switch (result.name) {
        case 'STRING_REQUIRED':
            return generateError('REQUIRED', extras);

        case 'STRING_INVALID_LENGTH':
            return generateError('EXACT_LENGTH', extras, ['token', accountTokenSchema.schema.token.length]);

        case 'STRING_INVALID_REGEX':
            return generateError('INVALID_REGEX', extras, ['token']);

        default:
            return generateError('UNKNOWN');
    }
}
