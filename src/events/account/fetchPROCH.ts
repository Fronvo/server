// ******************** //
// The fetchPROCH account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FetchPROCHResult,
    FetchPROCHServerParams,
} from 'interfaces/account/fetchPROCH';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError } from 'utilities/global';
import { getEnv } from 'variables/varUtils';

async function fetchPROCH({
    account,
    secret,
}: FetchPROCHServerParams): Promise<FetchPROCHResult | FronvoError> {
    if (secret != getEnv('PRO_SECRET')) {
        return generateError('UNKNOWN');
    }

    if (!account.isPRO || !account.proCH) {
        return generateError('UNKNOWN');
    }

    return { proCH: account.proCH };
}

const fetchPROCHTemplate: EventTemplate = {
    func: fetchPROCH,
    template: ['secret'],
    schema: new StringSchema({
        secret: {
            minLength: 36,
        },
    }),
    fetchAccount: true,
};

export default fetchPROCHTemplate;
