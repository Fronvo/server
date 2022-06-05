// ******************** //
// Reusable functions for the no-account-only events to avoid repetition.
// ******************** //

import { AccountData } from '@prisma/client';
import { insertDocument } from 'utilities/global';

export function convertToId(username: string): string {
    // 'Fronvo user 1' => 'fronvouser1'
    return username.replace(/ /g, '').toLowerCase();
}

export async function createAccount(
    accountDataPartial: Partial<AccountData>
): Promise<AccountData> {
    const accountData: AccountData = {
        id: accountDataPartial.id,
        email: accountDataPartial.email,
        username: accountDataPartial.username,
        password: accountDataPartial.password,
        creationDate: new Date() || accountDataPartial.creationDate,
    };

    await insertDocument('Account', { accountData }, accountDataPartial.id);

    return accountData;
}

export function getEmailDomain(email: string): string {
    return email.split('@')[1];
}
