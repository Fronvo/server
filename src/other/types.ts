// ******************** //
// Types for all kinds of files.
// ******************** //

export type CollectionNames = 'Account' | 'Token' | 'Report' | 'Log';

export type Errors = 'UNKNOWN' | 'MUST_BE_LOGGED_IN' | 'MUST_BE_LOGGED_OUT' | 'MISSING_ARGS'
                    | 'RATELIMITED' | 'REQUIRED' | 'LENGTH' | 'EXACT_LENGTH' | 'INVALID_EMAIL'
                    | 'INVALID_EMAIL_FORMAT' | 'INVALID_PASSWORD' | 'ACC_ALR_EXISTS' | 'ACC_DOESNT_EXIST'
                    | 'INVALID_REGEX' | 'INVALID_TOKEN' | 'PROFILE_NOT_FOUND';
