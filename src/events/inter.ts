// ******************** //
// Inter-server events, used for PM2-enabled server exchanges.
// ******************** //

import loginSocket from 'events/inter/loginSocket';
import logoutSocket from 'events/inter/logoutSocket';
import updateRateLimit from 'events/inter/updateRateLimit';

import { InterEventExportTemplate } from 'interfaces/all';

const interTemplate: InterEventExportTemplate = {
    loginSocket,
    logoutSocket,
    updateRateLimit,
};

export default interTemplate;
