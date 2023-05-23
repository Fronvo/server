// ******************** //
// Types for all kinds of files.
// ******************** //

export type Errors =
    | 'UNKNOWN'
    | 'LOGGED_IN'
    | 'LOGGED_OUT'
    | 'MISSING'
    | 'REQUIRED'
    | 'LENGTH'
    | 'LENGTH_EXACT'
    | 'NOT_BOOLEAN'
    | 'INVALID'
    | 'INVALID_REGEX'
    | 'EMAIL_TAKEN'
    | 'ID_TAKEN'
    | 'ACCOUNT_404'
    | 'ALREADY_IN_ROOM'
    | 'NOT_IN_ROOM'
    | 'NOT_OWNER'
    | 'NOT_IN_THIS_ROOM'
    | 'NOT_HIGHER'
    | 'TOO_MUCH';

export type TestAssertTypes =
    | 'string'
    | 'boolean'
    | 'number'
    | 'function'
    | 'object';

export type EnvValues =
    | 'ADMIN_PANEL_USERNAME'
    | 'ADMIN_PANEL_PASSWORD'
    | 'PRISMA_URL'
    | 'PERFORMANCE_REPORTS'
    | 'FRONVO_PERFORMANCE_REPORTS_MIN_MS'
    | 'EMAIL_BLACKLISTING_ENABLED'
    | 'SILENT_LOGGING'
    | 'BINARY_PARSER'
    | 'LOCAL_SAVE'
    | 'TEST_MODE'
    | 'RATELIMITER_POINTS'
    | 'RATELIMITER_DURATION'
    | 'RATELIMITER_POINTS_UNAUTHORISED'
    | 'RATELIMITER_DURATION_UNAUTHORISED'
    | 'EMAIL_USERNAME'
    | 'EMAIL_PASSWORD'
    | 'SETUP_MODE';
