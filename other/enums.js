const Enum = require('enum');

const JoiE = new Enum({
    TYPE_REQUIRED: 'any.required',
    TYPE_EMPTY: 'string.empty',
    TYPE_MIN: 'string.min',
    TYPE_MAX: 'string.max',
    TYPE_INVALID_EMAIL_FORMAT: 'string.email'
});

const General = new Enum({
    ERR_UNKNOWN: 1,
    ERR_LENGTH: 2
});

const Account = new Enum({
    ERR_REQUIRED: 3,
    ERR_INVALID_EMAIL_FORMAT: 4,
    ERR_ACC_DOESNT_EXIST: 5,
    ERR_INVALID_PASSWORD: 6,
    ERR_ACC_ALR_EXISTS: 7
});

module.exports = {
    JoiE,
    General,
    Account
}
