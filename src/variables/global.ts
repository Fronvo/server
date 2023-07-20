// ******************** //
// Reusable variables to lower code redundancy in other files.
// ******************** //

// Load environmental variables from this file, most needed here
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import { LoggedInSocket } from 'interfaces/all';
import { getEnv, getEnvBoolean } from './varUtils';

// Generic variables
const generatedFilesDirectory = resolve(__dirname, '../../generated');

// Reusable variables
export const blacklistedEmailDomainsEnabled = getEnvBoolean(
    'EMAIL_BLACKLISTING_ENABLED',
    true
);

export const setupMode = getEnvBoolean('SETUP_MODE', false);

export const loggedInSockets: { [socketId: string]: LoggedInSocket } = {};

// Passwords
export const mainBcryptHash = 12;

// Blacklisted emails: https://github.com/disposable-email-domains/disposable-email-domains
export const blacklistedEmailDomains: string[] =
    blacklistedEmailDomainsEnabled &&
    require(resolve(
        generatedFilesDirectory,
        'disposable_email_blocklist.json'
    ));

export const silentLogging = getEnvBoolean('SILENT_LOGGING', false);

// Prisma MongoDB client, filled in server.ts
export const prismaClient = new PrismaClient({
    datasources: {
        db: {
            url: getEnv('PRISMA_URL'),
        },
    },
});

// Email-related
export let emailUsername = getEnv('EMAIL_USERNAME');
export let emailPassword = getEnv('EMAIL_PASSWORD');

// ImageKit
// PRO plan
export let imagekitEndpoint = getEnv('IMAGEKIT_ENDPOINT');
export let imagekitPublic = getEnv('IMAGEKIT_PUBLIC');
export let imagekitPrivate = getEnv('IMAGEKIT_PRIVATE');

// FREE PLAN
export let imagekitFreeEndpoint = getEnv('IMAGEKIT2_ENDPOINT');
export let imagekitFreePublic = getEnv('IMAGEKIT2_PUBLIC');
export let imagekitFreePrivate = getEnv('IMAGEKIT2_PRIVATE');

// Tenor
export let tenorKey = getEnv('TENOR_KEY');

// Batch updates delay in ms, preferred range: [100 - 500]ms
export const batchUpdatesDelay = 250;
