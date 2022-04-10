// ******************** //
// Shared variables for the no-account-only event files.
// ******************** //

import { FronvoError } from 'interfaces/all';
import { MinMaxEntries } from 'interfaces/noAccount/shared';
import { joiErrorTypes } from 'other/enums';
import { accountSchema, accountTokenSchema } from 'other/schemas';
import { generateError } from 'utilities/global';

function getMinMaxEntriesForAccounts(): MinMaxEntries {
    const resultDict: MinMaxEntries = {
        email: {},
        password: {}
    };

    // @ts-ignore
    // Joi doesnt allow this but we dont care
    for(const [key, value] of accountSchema._ids._byKey.entries()) {
        if(!(key === 'email' || key === 'password')) continue;

        for(const [_, value2] of value.schema._singleRules.entries()) {
            if(!(value2.name === 'min' || value2.name === 'max')) continue;

            resultDict[key][value2.name] = value2.args.limit;
        }
    };

    return resultDict;
};

export function decideAccountSchemaResult(email: string, password: string): FronvoError {
    const schemaResult = accountSchema.validate({ email, password });

    if (!schemaResult.error)
        return;

    const schemaDetails = schemaResult.error.details[0];
    const schemaPath = schemaDetails.path[0];

    switch (schemaDetails.type) {
        case joiErrorTypes.TYPE_REQUIRED:
        case joiErrorTypes.TYPE_EMPTY:
            return generateError('REQUIRED', {for: schemaPath}, [schemaPath]);

        case joiErrorTypes.TYPE_MIN:
        case joiErrorTypes.TYPE_MAX:
            const limits = getMinMaxEntriesForAccounts();
            const min = limits[schemaPath].min;
            const max = limits[schemaPath].max;
            
            return generateError('LENGTH', {for: schemaPath, min, max}, [schemaPath, min, max]);

        case joiErrorTypes.TYPE_INVALID_EMAIL_FORMAT:
            return generateError('INVALID_EMAIL_FORMAT');

        case joiErrorTypes.TYPE_REGEX:
            return generateError('INVALID_REGEX', {for: schemaPath}, [schemaPath]);
    }

    return generateError('UNKNOWN');
}

export function decideAccountTokenSchemaResult(token: string): FronvoError {
    const schemaResult = accountTokenSchema.validate({ token });

    if (!schemaResult.error)
        return;

    switch (schemaResult.error.details[0].type) {
        case joiErrorTypes.TYPE_REQUIRED:
        case joiErrorTypes.TYPE_EMPTY:
            return generateError('REQUIRED', {for: 'token'}, ['token']);

        case joiErrorTypes.TYPE_LENGTH:
            return generateError('EXACT_LENGTH', {for: 'token'}, ['token', 36]);

        case joiErrorTypes.TYPE_REGEX:
            return generateError('INVALID_REGEX', {for: 'token'}, ['token']);
    }

    return generateError('UNKNOWN');
}
