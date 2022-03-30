// ******************** //
// Events which are usable regardless of login state.
// ******************** //

import isLoggedIn from 'events/general/isLoggedIn';

import { EventExportTemplate } from 'interfaces/all';

const generalTemplate: EventExportTemplate = {
    isLoggedIn
}

export default generalTemplate;
