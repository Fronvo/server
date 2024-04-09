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

// Firebase
import admin from 'firebase-admin';

// Generic variables
const generatedFilesDirectory = resolve(__dirname, '../../generated');

// Reusable variables
export const serverVersion = getEnv('VERSION');

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
            url: (getEnv('PRISMA_URL') as string).includes('+srv')
                ? getEnv('PRISMA_URL')
                : 'mongodb://localhost:27017/fronvo',
        },
    },
});

// Firebase, filled in server.ts
const firebaseCredentials = JSON.parse(getEnv('FIREBASE_CREDENTIALS') || '{}');

export let firebase: admin.app.App;

if (firebaseCredentials.project_id) {
    firebase = admin.initializeApp({
        projectId: firebaseCredentials.project_id,

        credential: admin.credential.cert({
            clientEmail: firebaseCredentials.client_email,
            privateKey: firebaseCredentials.private_key,
            projectId: firebaseCredentials.project_id,
        }),
    });
}

// Email-related
export const emailUsername = getEnv('EMAIL_USERNAME');
export const emailPassword = getEnv('EMAIL_PASSWORD');

// ImageKit
// PRO plan
export const imagekitEndpoint = getEnv('IMAGEKIT_ENDPOINT');
export const imagekitPublic = getEnv('IMAGEKIT_PUBLIC');
export const imagekitPrivate = getEnv('IMAGEKIT_PRIVATE');

// FREE PLAN
export const imagekitFreeEndpoint = getEnv('IMAGEKIT2_ENDPOINT');
export const imagekitFreePublic = getEnv('IMAGEKIT2_PUBLIC');
export const imagekitFreePrivate = getEnv('IMAGEKIT2_PRIVATE');

// Tenor
export const tenorKey = getEnv('TENOR_KEY');

// AES-256-CBC
export const aesEnc = getEnv('AES_ENC');
export const aesIV = getEnv('AES_IV');
export const AES_ENABLED =
    (aesEnc as string)?.trim().length == 32 &&
    (aesIV as string)?.trim().length == 16;

// Batch updates delay in ms, preferred range: [100 - 500]ms
export const batchUpdatesDelay = 250;

export const weeklyRestarts = getEnvBoolean('WEEKLY_RESTARTS', false);

// Official server
export const officialServer = getEnv('OFFICIAL_SERVER');
