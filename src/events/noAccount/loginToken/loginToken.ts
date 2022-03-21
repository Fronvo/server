// ******************** //
// The loginToken no-account-only event file.
// ******************** //

import { enums } from 'other/enums';
import { ERR_INVALID_TOKEN } from 'other/errors';
import { Token } from 'other/interfaces';
import * as utilities from 'other/utilities';
import { getTokenAccountId, getTokenKey } from 'other/utilities';
import { LoginToken } from './interfaces';
import { decideAccountTokenSchemaResult } from '../shared';

export default async function loginToken({ io, socket, token }: LoginToken): Promise<{} | Error> {
    // Schema validation
    const schemaResult = decideAccountTokenSchemaResult(token);
    if(schemaResult) return schemaResult;
    
    const tokens: Token[] = await utilities.listDocuments('tokens');

    for(const tokenItem in tokens) {
        if(token == getTokenKey(tokens, tokenItem)) {
            // Just login to the account
            utilities.loginSocket(io, socket, getTokenAccountId(tokens, tokenItem));
            return {};
        }
    }

    return utilities.generateError(ERR_INVALID_TOKEN, enums.ERR_INVALID_TOKEN);
}
