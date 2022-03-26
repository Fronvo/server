// ******************** //
// The starting point of the Fronvo server.
// ******************** //

// Port to attach to
const PORT = parseInt(process.env.PORT) || 3001;

// Admin panel
import { instrument, RedisStore } from '@socket.io/admin-ui';

// PM2
import { createAdapter } from '@socket.io/cluster-adapter';
import { setupWorker } from '@socket.io/sticky';

// Custom event files
import registerEvents from 'events/main';

// Cool-ish styling
import ora, { Ora } from 'ora';
import gradient from 'gradient-string';

// Other imports
import fs from 'fs';
import * as variables from 'other/variables';
import { decideBooleanEnvValue } from 'other/utilities';
import { Server } from 'socket.io';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents } from 'interfaces/all';
import { AnyError, MongoClient } from 'mongodb';

// Variables
let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
let loadingSpinner: Ora;
const loadingSpinnerDefaultText = 'Starting server';

function setLoading(currProcText: string): void {
    if(!variables.silentLogging) loadingSpinner.text = loadingSpinnerDefaultText + ': ' + currProcText;
}

function preStartupChecks(): void {
    function checkSilentLogging() {
        if(variables.silentLogging) console.log = () => {};
    }

    function checkRequiredFiles() {
        // Check directories
        for(let directory in variables.requiredStartupDirectories) {
            directory = variables.requiredStartupDirectories[directory];

            // No errors thrown with recursive option
            fs.mkdirSync(directory, {recursive: true});
        }

        // Check individual files
        for(const file in variables.requiredStartupFiles) {
            const fileObj = variables.requiredStartupFiles[file][Object.keys(variables.requiredStartupFiles[file])[0]];
            const filePath = fileObj.path;

            // This is optional for non-JSON files
            const fileTemplate = fileObj.template;

            // Overwrite if it doesnt exist
            if(!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, fileTemplate ? JSON.stringify(fileTemplate) : '');
            }
        }
    }

    checkSilentLogging();
    checkRequiredFiles();
}

function setupMongoDB(): Promise<void | AnyError> {
    return new Promise((resolve, reject) => {
        const mdbUsr = process.env.FRONVO_MONGODB_USERNAME;
        const mdbPass = process.env.FRONVO_MONGODB_PASSWORD;
        const mdbProj = process.env.FRONVO_MONGODB_PROJECT;
        const mdbDb = process.env.FRONVO_MONGODB_DB; // optional
    
        // Check environmental variables
        if(!mdbUsr || !mdbPass || !mdbProj) {
            reject('Some MongoDB variables are missing.');
        } else {
            setLoading('Setting up MongoDB');

            // MongoDB connection uri, customised for readability
            const mdbUri = 'mongodb+srv://' + 
                            mdbUsr +
                            ':' +
                            mdbPass +
                            '@' +
                            mdbProj +
                            '.mongodb.net/' +
                            mdbDb || 'fronvo' +
                            '?retryWrites=true&w=majority';

            // Create the MongoDB client
            const mdbClient = new MongoClient(mdbUri);

            // Finally, try to connect with the given credentials
            mdbClient.connect((err) => {
                if(err) {
                    reject(err);
                } else {
                    // variables.js comment
                    variables.setMDB(mdbClient.db(mdbDb || 'fronvo'));
                    resolve(null);
                }
            });
        }
    });
};

function setupServer(): void {
    setLoading('Setting up the server process, server events and admin panel');

    // Setup the socket.io server with tailored options
    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(PORT, {
        serveClient: false,
        wsEngine: require('eiows').Server,
        path: '/fronvo',
    
        // Admin panel
        cors: {
            origin: ['https://admin.socket.io'],
            credentials: true
        },

        // Enable / Disable binary parser
        parser: decideBooleanEnvValue(process.env.FRONVO_BINARY_PARSER, true) ? require('socket.io-msgpack-parser') : ''
    })
}

function setupServerEvents(): void {
    registerEvents(io);
}

function setupPM2(): void {
    // Mostly for hosting on production
    if(variables.cluster) {
        io.adapter(createAdapter());
        setupWorker(io);
    }
}

function setupAdminPanel(): void {
    const panel_usr = process.env.FRONVO_ADMIN_PANEL_USERNAME;
    const panel_pass = process.env.FRONVO_ADMIN_PANEL_PASSWORD;

    // Check environmental variables and hash the admin panel password
    if(panel_usr && panel_pass) {
        instrument(io, {
            auth: {
                type: 'basic',
                username: panel_usr,

                // hash
                password: require('bcrypt').hashSync(panel_pass, 10)
            },

            // preserve users who logged in with the panel before
            store: new RedisStore(null),

            readonly: true
        });
    }
}

function startup(): void {
    // Prevent startup logging, too
    preStartupChecks();

    // Gradient shenanigans
    console.log(gradient(['#e8128f', '#e812d2', '#e412e8', '#cb12e8', '#bd12e8', '#a812e8', '#8f12e8', '#8012e8'])('Fronvo server v0.1'));

    // Special check because ora doesnt care
    if(!variables.silentLogging) {
        loadingSpinner = ora({
            text: loadingSpinnerDefaultText,
            spinner: 'dots12', // wonky windows 10 style
            interval: 40,
            color: 'magenta'
        }).start();
    }

    // Attempt to run each check one-by-one
    if(!variables.localMode) {
        setupMongoDB().then(() => {
            postDBInit();
            
        }).catch((err: Error) => {
            // Depends on the error's context
            if(!variables.silentLogging) loadingSpinner.fail(err.message ? err.message : String(err));
        });

    } else {
        postDBInit();
    }

    function postDBInit() {
        setupServer();
        setupServerEvents();
        setupPM2();
        setupAdminPanel();
    
        // Finally, display successful server run
        if(!variables.silentLogging) loadingSpinner.succeed('Server running at port ' + PORT + '.');
    }
}

startup();
