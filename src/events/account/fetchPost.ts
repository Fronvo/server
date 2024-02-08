// ******************** //
// The fetchPost account event file.
// ******************** //

import {
    FetchPostResult,
    FetchPostServerParams,
} from 'interfaces/account/fetchPost';
import { EventTemplate, FronvoError } from 'interfaces/all';

async function fetchPost({}: FetchPostServerParams): Promise<
    FetchPostResult | FronvoError
> {
    return {};
}

const fetchPostTemplate: EventTemplate = {
    func: fetchPost,
    template: [],
};

export default fetchPostTemplate;
