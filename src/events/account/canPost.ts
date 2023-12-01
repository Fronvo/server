// ******************** //
// The canPost account event file.
// ******************** //

import { differenceInMinutes } from 'date-fns';
import { CanPostResult, CanPostServerParams } from 'interfaces/account/canPost';
import { EventTemplate, FronvoError } from 'interfaces/all';

async function canPost({
    account,
}: CanPostServerParams): Promise<CanPostResult | FronvoError> {
    return {
        canPost:
            account.isPRO ||
            !account.lastPostAt ||
            differenceInMinutes(new Date(), account.lastPostAt) > 10,
    };
}

const canPostTemplate: EventTemplate = {
    func: canPost,
    template: [],
};

export default canPostTemplate;
