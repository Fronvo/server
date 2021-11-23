// The server of Fronvo
// Shadofer#6681

// Load .env, get parent directory regardless of node directory
const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '..') + '/.env' });

// Port to attach to
const PORT = process.env.PORT || 3001;

// Admin panel
const { instrument, RedisStore } = require('@socket.io/admin-ui');

// PM2
const { createAdapter } = require('@socket.io/cluster-adapter');
const { setupWorker } = require('@socket.io/sticky');

// MongoDB
const { MongoClient } = require('mongodb');

// Custom event files
const registerEvents = require('../events/main');

// Cool-ish styling
const ora = require('ora');
const gradient = require('gradient-string');

var io, mdbClient, loadingSpinner;
const loadingSpinnerDefaultText = 'Starting server';

function setLoading(currProcText) {
    loadingSpinner.text = loadingSpinnerDefaultText + ': ' + currProcText;
}

function setupMongoDB() {
    return new Promise((resolve, reject) => {
        const mdbUsr = process.env.FRONVO_MONGODB_USERNAME;
        const mdbPass = process.env.FRONVO_MONGODB_PASSWORD;
        const mdbProj = process.env.FRONVO_MONGODB_PROJECT;
        const mdbDb = process.env.FRONVO_MONGODB_DB; // optional
    
        if(!mdbUsr || !mdbPass || !mdbProj) {
            reject('Some MongoDB variables are missing.');
        } else {    
            setLoading('Setting up MongoDB');

            const mdbUri = 'mongodb+srv://' + 
                            mdbUsr +
                            ':' +
                            mdbPass +
                            '@' +
                            mdbProj +
                            '.mongodb.net/' +
                            mdbDb || 'fronvo' +
                            '?retryWrites=true&w=majority';
    
            mdbClient = new MongoClient(mdbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

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
    // this wont be seen by most devices, way too fast of a process
    setLoading('Setting up the server process, server events and admin panel');

    io = require('socket.io')(PORT, {
        serveClient: false,
        wsEngine: require('eiows').Server,
        path: '/fronvo',
    
        // admin panel
        cors: {
            origin: ['https://admin.socket.io'],
            credentials: true
        },
        
        parser: require('socket.io-msgpack-parser')
    });
}

function setupServerEvents() {
    registerEvents(io, mdbClient.db('fronvo'));
}

function setupPM2() {
    if(process.env.TARGET_PM2) {
        io.adapter(createAdapter());
        setupWorker(io);
    }
}

function setupAdminPanel() {
    const panel_usr = process.env.FRONVO_ADMIN_PANEL_USERNAME;
    const panel_pass = process.env.FRONVO_ADMIN_PANEL_PASSWORD;

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
    console.log(gradient(['#e8128f', '#e812d2', '#e412e8', '#cb12e8', '#bd12e8', '#a812e8', '#8f12e8', '#8012e8'])('Fronvo server v0.1'));

    loadingSpinner = ora({
        text: loadingSpinnerDefaultText,
        spinner: 'dots12', // wonky windows 10 style
        interval: 40,
        color: 'magenta'
    }).start();

    setupMongoDB().then(() => {
        setupServer();
        setupServerEvents();
        setupPM2();
        setupAdminPanel();

        loadingSpinner.succeed('Server running at port ' + PORT + '.');
    }).catch((err) => {
        loadingSpinner.fail(err.message);
    });
}

startup();
