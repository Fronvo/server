// ******************** //
// The starting point of the Fronvo server.
// ******************** //

// Load .env, get parent directory regardless of node directory
const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '..', '.env') });

// Port to attach to
const PORT = process.env.PORT || 3001;

// Admin panel
const { instrument, RedisStore } = require('@socket.io/admin-ui');

// PM2
const { createAdapter } = require('@socket.io/cluster-adapter');
const { setupWorker } = require('@socket.io/sticky');

// Custom event files
const registerEvents = require('../events/main');

// Cool-ish styling
const ora = require('ora');
const gradient = require('gradient-string');

// Variables
var io, mdbClient, loadingSpinner;
const loadingSpinnerDefaultText = 'Starting server';
const variables = require('../other/variables');
const { decideBooleanEnvValue } = require('../other/utilities');

function setLoading(currProcText) {
    if(!variables.silentLogging) loadingSpinner.text = loadingSpinnerDefaultText + ': ' + currProcText;
}

function preStartupChecks() {
    // Disable logging
    if(variables.silentLogging) console.log = () => {};
}

function setupMongoDB() {
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

            // Create the MongoDB client with optimised options
            const { MongoClient } = require('mongodb');

            mdbClient = new MongoClient(mdbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            // Finally, try to connect with the given credentials
            mdbClient.connect((err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    });
};

function setupServer() {
    setLoading('Setting up the server process, server events and admin panel');

    // Setup the socket.io server with tailored options
    io = require('socket.io')(PORT, {
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
    });
}

function setupServerEvents() {
    registerEvents(io, !variables.localMode ? mdbClient.db('fronvo') : null);
}

function setupPM2() {
    // Mostly for hosting on production
    if(process.env.TARGET_PM2 == 'true') {
        io.adapter(createAdapter());
        setupWorker(io);
    }
}

function setupAdminPanel() {
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
            store: new RedisStore(),

            readonly: true
        });
    }
}

function startup() {
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
            
        }).catch((err) => {
            // Depends on the error's context
            if(!variables.silentLogging) loadingSpinner.fail(err.message ? err.message : err);
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
