// ******************** //
// The loginToken no-account-only event file.
// ******************** //

import { TokenData } from '@prisma/client';
import { decideAccountTokenSchemaResult } from 'events/noAccount/shared';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { LoginTokenResult, LoginTokenServerParams } from 'interfaces/noAccount/loginToken';
import { enums } from 'other/enums';
import { ERR_INVALID_TOKEN } from 'other/errors';
import * as utilities from 'utilities/global';

async function loginToken({ io, socket, token }: LoginTokenServerParams): Promise<LoginTokenResult | FronvoError> {
    // Schema validation
    const schemaResult = decideAccountTokenSchemaResult(token);
    if(schemaResult) return schemaResult;
    
    const tokens: {tokenData: TokenData}[] = await utilities.findDocuments('Token', {select: {tokenData: true}});

    for(const tokenIndex in tokens) {
        const tokenData = tokens[tokenIndex].tokenData;

        if(tokenData.token == token) {
            // Just login to the account
            utilities.loginSocket(io, socket, tokenData.accountId);
            return {};
        }
    }

    return utilities.generateError(ERR_INVALID_TOKEN, enums.ERR_INVALID_TOKEN);
}

const loginTokenTemplate: EventTemplate = {
    func: loginToken,
    template: ['token'],
    points: 5
};

export default loginTokenTemplate;
