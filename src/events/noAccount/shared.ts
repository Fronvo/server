// ******************** //
// Shared variables for the no-account-only event files.
// ******************** //

import { FronvoError } from 'interfaces/all';
import { MinMaxEntries } from 'interfaces/noAccount/shared';
import { enums, joiErrorTypes } from 'other/enums';
import * as errors from 'other/errors';
import { accountSchema, accountTokenSchema } from 'other/schemas';
import { defaultError } from 'other/variables';
import { format } from 'util';
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
    const schemaResult = accountSchema.validate({
        email: email,
        password: password
    });

    if (!schemaResult.error)
        return;

    const schemaDetails = schemaResult.error.details[0];
    const schemaType = schemaDetails.type;
    const schemaMessage = schemaDetails.message;
    const schemaPath = schemaDetails.path[0];

    // Default dictionary to reuse, copy its values
    const resultDict = { ...defaultError };

    // Default to JOI message
    resultDict.err.msg = schemaMessage;

    if (schemaPath === 'email' || schemaPath === 'password') {

        // Provide additional info for the end user
        resultDict.err.extras = { for: schemaPath };

        const limits = getMinMaxEntriesForAccounts();

        switch (schemaType) {

            // Fall-through, reuse
            case joiErrorTypes.TYPE_REQUIRED:
            case joiErrorTypes.TYPE_EMPTY:
                resultDict.err.msg = format(errors.ERR_REQUIRED, schemaPath);
                resultDict.err.code = enums.ERR_REQUIRED;
                break;

            case joiErrorTypes.TYPE_MIN:
            case joiErrorTypes.TYPE_MAX:
                resultDict.err.msg = format(errors.ERR_LENGTH, schemaPath, limits[schemaPath].min, limits[schemaPath].max);
                resultDict.err.code = enums.ERR_LENGTH;
                resultDict.err.extras.min = limits[schemaPath].min;
                resultDict.err.extras.max = limits[schemaPath].max;
                break;

            case joiErrorTypes.TYPE_INVALID_EMAIL_FORMAT:
                resultDict.err.msg = errors.ERR_INVALID_EMAIL_FORMAT;
                resultDict.err.code = enums.ERR_INVALID_EMAIL_FORMAT;
                break;
        }
    }

    return generateError(resultDict.err.msg, resultDict.err.code, { ...resultDict.err.extras });
}

export function decideAccountTokenSchemaResult(token: string): FronvoError {
    const schemaResult = accountTokenSchema.validate({ token });

    if (!schemaResult.error)
        return;

    const resultDict = { ...defaultError };

    switch (schemaResult.error.details[0].type) {
        case joiErrorTypes.TYPE_REQUIRED:
        case joiErrorTypes.TYPE_EMPTY:
            resultDict.err.msg = format(errors.ERR_REQUIRED, 'token');
            resultDict.err.code = enums.ERR_REQUIRED;
            break;

        case joiErrorTypes.TYPE_LENGTH:
            resultDict.err.msg = format(errors.ERR_EXACT_LENGTH, 'token', 36);
            resultDict.err.code = enums.ERR_EXACT_LENGTH;
            break;

        case joiErrorTypes.TYPE_REGEX:
            resultDict.err.msg = format(errors.ERR_INVALID_REGEX, 'token');
            resultDict.err.code = enums.ERR_INVALID_REGEX;
            break;
    }

    return generateError(resultDict.err.msg, resultDict.err.code, { ...resultDict.err.extras });
}
