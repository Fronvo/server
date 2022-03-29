// ******************** //
// The isLoggedIn general event file.
// ******************** //

import { IsLoggedInResult, isLoggedInServerParams } from 'interfaces/general/isLoggedIn';
import { isSocketLoggedIn } from 'utilities/global';

export default ({ socket }: isLoggedInServerParams): IsLoggedInResult => {
    return {loggedIn: isSocketLoggedIn(socket)};
}
