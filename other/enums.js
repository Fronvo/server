const Enum = require('enum');

const JoiE = new Enum({
    TYPE_REQUIRED: 'any.required',
    TYPE_EMPTY: 'string.empty',
    TYPE_MIN: 'string.min',
    TYPE_MAX: 'string.max',
    TYPE_LENGTH: 'string.length',
    TYPE_INVALID_EMAIL_FORMAT: 'string.email',
    TYPE_REGEX: 'string.pattern.base',
});

const General = new Enum({
    ERR_UNKNOWN: 1,
    ERR_LENGTH: 2,
    ERR_EXACT_LENGTH: 3,
    ERR_REQUIRED: 4,
    ERR_MISSING_ARGS: 5,
});

const Account = new Enum({
    ERR_INVALID_EMAIL_FORMAT: 6,
    ERR_ACC_DOESNT_EXIST: 7,
    ERR_INVALID_PASSWORD: 8,
    ERR_ACC_ALR_EXISTS: 9,
    ERR_INVALID_REGEX: 10,
    ERR_INVALID_TOKEN: 11,
    ERR_MUST_BE_LOGGED_IN: 12,
    ERR_MUST_BE_LOGGED_OUT: 13
});

module.exports = {
    JoiE,
    General,
    Account
}
