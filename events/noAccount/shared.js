// ******************** //
// Shared variables for the no-account-only event files.
// ******************** //

const schemas = require('../../other/schemas');
const { defaultError } = require('../../other/variables');
const { JoiE, enums } = require('../../other/enums');
const errors = require('../../other/errors');
const { generateError } = require('../../other/utilities');

function getMinMaxEntriesForAccounts() {
    const resultDict = {email: {}, password: {}};

    for(const [key, value] of schemas.accountSchema._ids._byKey.entries()) {
        if(!(key === 'email' || key === 'password')) continue;

        for(const [_, value2] of value.schema._singleRules.entries()) {
            if(!(value2.name === 'min' || value2.name === 'max')) continue;

            resultDict[key][value2.name] = value2.args.limit;
        }
    };

    return resultDict;
};

module.exports = {
    decideAccountSchemaResult: (email, password) => {
        const schemaResult = schemas.accountSchema.validate({
            email: email,
            password: password
        });
    
        if(!schemaResult.error) return false;
    
        const schemaDetails = schemaResult.error.details[0];
        const schemaType = schemaDetails.type;
        const schemaMessage = schemaDetails.message;
        const schemaPath = schemaDetails.path[0];
    
        // Default dictionary to reuse, copy its values
        const resultDict = {...defaultError};
    
        // Default to JOI message
        resultDict.msg = schemaMessage;
    
        if(schemaPath === 'email' || schemaPath === 'password') {
    
            // Provide additional info for the end user
            resultDict['extras'] = {for: schemaPath};
    
            const limits = getMinMaxEntriesForAccounts();
    
            switch(schemaType) {
    
                // Fall-through, reuse
                case JoiE.TYPE_REQUIRED:
                case JoiE.TYPE_EMPTY:
                    resultDict.msg = format(errors.ERR_REQUIRED, schemaPath);
                    resultDict.code = enums.ERR_REQUIRED;
                    break;
    
                case JoiE.TYPE_MIN:
                case JoiE.TYPE_MAX:
                    resultDict.msg = format(errors.ERR_LENGTH, schemaPath, limits[schemaPath].min, limits[schemaPath].max);
                    resultDict.code = enums.ERR_LENGTH;
                    resultDict.extras['min'] = limits[schemaPath].min;
                    resultDict.extras['max'] = limits[schemaPath].max;
                    break;
    
                case JoiE.TYPE_INVALID_EMAIL_FORMAT:
                    resultDict.msg = errors.ERR_INVALID_EMAIL_FORMAT;
                    resultDict.code = enums.ERR_INVALID_EMAIL_FORMAT;
                    break;
            }
        }
        
        return generateError(resultDict.msg, resultDict.code, {...resultDict});
    },

    decideAccountTokenSchemaResult: (token) => {
        const schemaResult = schemas.accountTokenSchema.validate({
            token: token
        });
        
        if(!schemaResult.error) return false;
    
        const resultDict = {...defaultError};
    
        switch(schemaResult.error.details[0].type) {
            case JoiE.TYPE_REQUIRED:
            case JoiE.TYPE_EMPTY:
                resultDict.msg = format(errors.ERR_REQUIRED, 'token');
                resultDict.code = enums.ERR_REQUIRED;
                break;
    
            case JoiE.TYPE_LENGTH:
                resultDict.msg = format(errors.ERR_EXACT_LENGTH, 'token', 36);
                resultDict.code = enums.ERR_EXACT_LENGTH;
                break;
    
            case JoiE.TYPE_REGEX:
                resultDict.msg = format(errors.ERR_INVALID_REGEX, 'token');
                resultDict.code = enums.ERR_INVALID_REGEX;
                break;
        }
    
        return generateError(resultDict.msg, resultDict.code, {...resultDict});
    }
}
