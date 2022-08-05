// ******************** //
// Reusable functions for the no-account-only events to avoid repetition.
// ******************** //

export function getEmailDomain(email: string): string {
    return email.split('@')[1];
}
