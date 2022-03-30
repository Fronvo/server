// ******************** //
// Interfaces for the possible enum error codes.
// ******************** //

export interface Enums {
    ERR_UNKNOWN: number;
    ERR_RATELIMITED: number;
    ERR_LENGTH: number
    ERR_EXACT_LENGTH: number;
    ERR_REQUIRED: number;
    ERR_MISSING_ARGS: number;
    ERR_INVALID_EMAIL: number;
    ERR_INVALID_EMAIL_FORMAT: number;
    ERR_ACC_DOESNT_EXIST: number;
    ERR_ACC_ALR_EXISTS: number;
    ERR_INVALID_PASSWORD: number;
    ERR_INVALID_REGEX: number;
    ERR_INVALID_TOKEN: number;
    ERR_MUST_BE_LOGGED_IN: number;
    ERR_MUST_BE_LOGGED_OUT: number;
    ERR_PROFILE_NOT_FOUND: number;
}
