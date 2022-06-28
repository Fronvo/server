// ******************** //
// Reusable variables to lower code redundancy in other files.
// ******************** //

// Load environmental variables from this file, most needed here
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../.env') });

import {
    LocalDict,
    LoggedInSocket,
    PerformanceReport,
    RequiredStartupFile,
} from 'interfaces/all';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import { EzierLimiter } from '@ezier/ratelimit';
import { CollectionNames } from '../other/types';
import { getEnvBoolean, getEnv } from './varUtils';

// Generic variables
const generatedFilesDirectory = resolve(__dirname, '../../generated');

// Add generated paths here
const localDBDirectory = resolve(generatedFilesDirectory, 'local');
export const localDBPath = resolve(localDBDirectory, 'db.json');

// File templates
const localDBTemplate: { [CollectionName in CollectionNames]: {}[] } = {
    Account: [],
    Token: [],
    Report: [],
    Log: [],
};

// Reusable variables
export const blacklistedEmailDomainsEnabled = getEnvBoolean(
    'EMAIL_BLACKLISTING_ENABLED',
    true
);
export const testMode = getEnvBoolean('TEST_MODE', false);

export const localMode = !getEnv('PRISMA_URL', false) || testMode;

export const localSave = getEnvBoolean('LOCAL_SAVE', true) && !testMode;

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

// When using PM2 for production
export const cluster = getEnvBoolean('TARGET_PM2', false);

// Directories/Files to check at startup
export const requiredStartupDirectories = [localDBDirectory];
export const requiredStartupFiles: [{ [file: string]: RequiredStartupFile }] = [
    { localDBItem: { path: localDBPath, template: localDBTemplate } },
];

// Blacklisted emails: https://github.com/disposable-email-domains/disposable-email-domains
export const blacklistedEmailDomains: string[] =
    blacklistedEmailDomainsEnabled &&
    require(resolve(
        generatedFilesDirectory,
        'disposable_email_blocklist.json'
    ));

export const silentLogging = testMode || getEnvBoolean('SILENT_LOGGING', false);

// The local virtualised Mongo database
export const localDB: { [Collection in CollectionNames]: LocalDict[] } =
    localMode && localSave && existsSync(localDBPath)
        ? require(localDBPath)
        : localDBTemplate;

// Prisma MongoDB client, filled in server.ts
export const prismaClient = !localMode ? new PrismaClient() : null;

export let rateLimiter: EzierLimiter;

export function setRateLimiter(rateLimiterObject: EzierLimiter): void {
    rateLimiter = rateLimiterObject;
}

// Email-related
export let emailUsername = getEnv('EMAIL_USERNAME');
export let emailPassword = getEnv('EMAIL_PASSWORD');
