// ******************** //
// The loginToken no-account-only event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { TokenData } from '@prisma/client';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { LoginTokenResult, LoginTokenServerParams } from 'interfaces/noAccount/loginToken';
import * as utilities from 'utilities/global';

async function loginToken({ io, socket, token }: LoginTokenServerParams): Promise<LoginTokenResult | FronvoError> {
    const tokens: {tokenData: TokenData}[] = await utilities.findDocuments('Token', {select: {tokenData: true}});

    for(const tokenIndex in tokens) {
        const tokenData = tokens[tokenIndex].tokenData;

        if(tokenData.token == token) {
            // Just login to the account
            utilities.loginSocket(io, socket, tokenData.accountId);
            return {};
        }
    }

    return utilities.generateError('INVALID_TOKEN');
}

const loginTokenTemplate: EventTemplate = {
    func: loginToken,
    template: ['token'],
    points: 5,
    schema: new StringSchema({
        token: {
            type: 'uuid'
        }
    })
};

export default loginTokenTemplate;
