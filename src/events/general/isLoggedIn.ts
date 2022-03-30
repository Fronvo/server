// ******************** //
// The isLoggedIn general event file.
// ******************** //

import { EventTemplate } from 'interfaces/all';
import { IsLoggedInResult, isLoggedInServerParams } from 'interfaces/general/isLoggedIn';
import { isSocketLoggedIn } from 'utilities/global';

function isLoggedIn({ socket }: isLoggedInServerParams): IsLoggedInResult {
    return {loggedIn: isSocketLoggedIn(socket)};
}

const isLoggedInTemplate: EventTemplate = {
    func: isLoggedIn,
    template: [],
    points: 1
}

export default isLoggedInTemplate;
