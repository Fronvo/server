// ******************** //
// The sendPost account event file.
// ******************** //

import {
    SendPostResult,
    SendPostServerParams,
} from 'interfaces/account/sendPost';
import { EventTemplate, FronvoError } from 'interfaces/all';

async function sendPost({}: SendPostServerParams): Promise<
    SendPostResult | FronvoError
> {
    return {};
}

const sendPostTemplate: EventTemplate = {
    func: sendPost,
    template: [],
};

export default sendPostTemplate;
