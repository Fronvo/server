// ******************** //
// Shared interfaces for the no-account-only event files.
// ******************** //

export interface MinMaxEntries {
    email: {
        min?: number;
        max?: number;
    },

    password: {
        min?: number;
        max?: number;
    }
}
