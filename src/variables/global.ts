// ******************** //
// Reusable variables to lower code redundancy in other files.
// ******************** //

// Load environmental variables from this file, most needed here
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import { LoggedInSocket, PerformanceReport } from 'interfaces/all';
import { getEnv, getEnvBoolean } from './varUtils';

// Generic variables
const generatedFilesDirectory = resolve(__dirname, '../../generated');

// Reusable variables
export const blacklistedEmailDomainsEnabled = getEnvBoolean(
    'EMAIL_BLACKLISTING_ENABLED',
    true
);
export const testMode = getEnvBoolean('TEST_MODE', false);

export const setupMode = getEnvBoolean('SETUP_MODE', false);

export const loggedInSockets: { [socketId: string]: LoggedInSocket } = {};

// Passwords
export const mainBcryptHash = 12;

// Performance logs for functions
export const performanceReportsEnabled = getEnvBoolean(
    'PERFORMANCE_REPORTS',
    false
);

// Storage of temporary performance reports if applicable
export const performanceReports: { [perfUUID: string]: PerformanceReport } = {};

// Minimum performance log'd function ms duration in order to be uploaded
export const performanceReportsMinMS = getEnv(
    'FRONVO_PERFORMANCE_REPORTS_MIN_MS',
    -1
) as number;

// Blacklisted emails: https://github.com/disposable-email-domains/disposable-email-domains
export const blacklistedEmailDomains: string[] =
    blacklistedEmailDomainsEnabled &&
    require(resolve(
        generatedFilesDirectory,
        'disposable_email_blocklist.json'
    ));

export const silentLogging = testMode || getEnvBoolean('SILENT_LOGGING', false);

// Prisma MongoDB client, filled in server.ts
export const prismaClient = new PrismaClient({
    datasources: {
        db: {
            url: !testMode
                ? getEnv('PRISMA_URL')
                : 'mongodb://localhost:27017/fronvo',
        },
    },
});

// Email-related
export let emailUsername = getEnv('EMAIL_USERNAME');
export let emailPassword = getEnv('EMAIL_PASSWORD');

// Logging requests for simple telemetry
export function incrementTotalRequests(): void {
    totalRequests += 1;
}

export function resetTotalRequests(): void {
    totalRequests = 0;
}

export function getTotalRequests(): number {
    return totalRequests;
}

export let totalRequests = 0;
