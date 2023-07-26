// ******************** //
// The fetchLatestVersion account event file.
// ******************** //

import {
    FetchLatestVersionResult,
    FetchLatestVersionServerParams,
} from 'interfaces/account/fetchLatestVersion';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { serverVersion } from 'variables/global';

async function fetchLatestVersion({}: FetchLatestVersionServerParams): Promise<
    FetchLatestVersionResult | FronvoError
> {
    return { version: serverVersion };
}

const fetchLatestVersionTemplate: EventTemplate = {
    func: fetchLatestVersion,
    template: [],
};

export default fetchLatestVersionTemplate;
