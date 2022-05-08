// ******************** //
// Inter-server events, used for PM2-enabled server exchanges.
// ******************** //

import loginSocket from 'events/inter/loginSocket';
import logoutSocket from 'events/inter/logoutSocket';
import updateRateLimit from 'events/inter/updateRateLimit';
import updateRateLimitUnauthorised from 'events/inter/updateRateLimitUnauthorised';

import { InterEventExportTemplate } from 'interfaces/all';

const interTemplate: InterEventExportTemplate = {
    loginSocket,
    logoutSocket,
    updateRateLimit,
    updateRateLimitUnauthorised,
};

export default interTemplate;
