// ******************** //
// Events which are only usable while logged in.
// ******************** //

import fetchProfileId from 'events/account/fetchProfileId';
import fetchProfileData from 'events/account/fetchProfileData';
import logout from 'events/account/logout';

import { EventExportTemplate } from 'interfaces/all';

const accountTemplate: EventExportTemplate = {
    fetchProfileId,
    fetchProfileData,
    logout
}

export default accountTemplate;
