// ******************** //
// The isLoggedIn general event file.
// ******************** //

import { EventArguments } from 'other/interfaces';
import { isSocketLoggedIn } from 'other/utilities';
import { IsLoggedInResult } from './interfaces';

export default function isLoggedIn({ socket }: EventArguments): IsLoggedInResult {
    return {loggedIn: isSocketLoggedIn(socket)};
}
