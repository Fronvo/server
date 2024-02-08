// ******************** //
// The fetchTurboCH account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FetchTurboCHResult,
    FetchTurboCHServerParams,
} from 'interfaces/account/fetchTurboCH';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { decryptAES, generateError } from 'utilities/global';
import { getEnv } from 'variables/varUtils';

async function fetchTurboCH({
    account,
    secret,
}: FetchTurboCHServerParams): Promise<FetchTurboCHResult | FronvoError> {
    if (secret != getEnv('TURBO_SECRET')) {
        return generateError('UNKNOWN');
    }

    if (!account.turbo || !account.turboCH) {
        return generateError('UNKNOWN');
    }

    return { turboCH: decryptAES(account.turboCH) };
}

const fetchPROCHTemplate: EventTemplate = {
    func: fetchTurboCH,
    template: ['secret'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },
    }),
};

export default fetchPROCHTemplate;
