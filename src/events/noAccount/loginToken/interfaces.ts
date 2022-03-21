// ******************** //
// Interfaces for the loginToken no-account-only event file.
// ******************** //

import { EventArguments } from 'other/interfaces';

export interface LoginToken extends EventArguments {
    token: string;
}
