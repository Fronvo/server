// ******************** //
// Reusable functions for the no-account-only events to avoid repetition.
// ******************** //

export function convertToId(username: string): string {
    // 'Fronvo user 1' => 'fronvouser1'
    return username.replace(/ /g, '').toLowerCase();
}

export function getEmailDomain(email: string): string {
    return email.split('@')[1];
}
