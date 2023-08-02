// ******************** //
// The fetchTenor account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import {
    FetchTenorResult,
    FetchTenorServerParams,
    TenorGifs,
} from 'interfaces/account/fetchTenor';
import { EventTemplate, FronvoError } from 'interfaces/all';
import fetch from 'node-fetch';
import { generateError } from 'utilities/global';
import { tenorKey } from 'variables/global';

async function fetchTenor({
    q,
}: FetchTenorServerParams): Promise<FetchTenorResult | FronvoError> {
    const gifs: TenorGifs[] = [];
    // All clients agree with this
    const limit = 26;

    let modifiedTenorKey = tenorKey;

    if (modifiedTenorKey[0] == '[') {
        modifiedTenorKey = modifiedTenorKey
            .replace('[', '')
            .replace(/'/g, '')
            .replace(']', '')
            .split(', ');

        modifiedTenorKey =
            modifiedTenorKey[
                Math.floor(Math.random() * modifiedTenorKey.length)
            ];
    } else {
        modifiedTenorKey = modifiedTenorKey.replace(/'/g, '');
    }

    const res = await (
        await fetch(
            `https://tenor.googleapis.com/v2/search?q=${q}&limit=${limit}&key=${modifiedTenorKey}`
        )
    ).json();

    if (!res) {
        return generateError('UNKNOWN');
    }

    const resResults = res.results;

    for (const resultIndex in resResults) {
        const target = resResults[resultIndex].media_formats;

        gifs.push({
            gif: target.gif?.url,
            gif_medium: target.mediumgif?.url,
            gif_nano: target.nanogif?.url,
            gif_tiny: target.tinygif?.url,
        });
    }

    return { gifs };
}

const fetchTenorTemplate: EventTemplate = {
    func: fetchTenor,
    template: ['q'],
    schema: new StringSchema({
        q: {
            minLength: 1,
            maxLength: 64,
        },
    }),
    dontFetchAccount: true,
};

export default fetchTenorTemplate;
