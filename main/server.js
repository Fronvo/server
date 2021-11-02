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

var io, mdbClient;

function setupMongoDB() {
    return new Promise((resolve, reject) => {
        const mdbUsr = process.env.FRONVO_MONGODB_USERNAME;
        const mdbPass = process.env.FRONVO_MONGODB_PASSWORD;
        const mdbProj = process.env.FRONVO_MONGODB_PROJECT;
        const mdbDb = process.env.FRONVO_MONGODB_DB; // optional
    
        if(!mdbUsr || !mdbPass || !mdbProj) {
            reject('Some MongoDB variables are missing.');
        } else {    
            console.log('Setting up MongoDB...');

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
                    console.log('MongoDB setup successfully.');
                    resolve();
                }
            });
        }
    });
};

function setupServer() {
    console.log('Setting up server...');

    io = require('socket.io')(PORT, {
        serveClient: false,
        wsEngine: require('eiows').Server,
        path: '/fronvo',
    
        // admin panel
        cors: {
            origin: ['https://admin.socket.io'],
            credentials: true
        }
    });

    console.log('Server setup successfully.');
}

function setupServerEvents() {
    console.log('Setting up server events...');

    registerEvents(io, mdbClient.db('fronvo'));

    console.log('Server events setup successfully.');
}

function setupPM2() {
    if(process.env.TARGET_PM2) {
        console.log('Setting up PM2...');

        io.adapter(createAdapter());
        setupWorker(io);

        console.log('PM2 setup successfully.');
    } else {
        console.log('PM2 setup skipped.');
    }
}

function setupAdminPanel() {
    const panel_usr = process.env.FRONVO_ADMIN_PANEL_USERNAME;
    const panel_pass = process.env.FRONVO_ADMIN_PANEL_PASSWORD;

    if(panel_usr && panel_pass) {
        console.log('Setting up admin panel...');

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

        console.log('Admin panel setup successfully.');
    } else {
        console.log('Admin panel setup skipped.');
    }
}

function startup() {
    setupMongoDB().then(() => {
        setupServer();
        setupServerEvents();
        setupPM2();
        setupAdminPanel();

        console.log('Server running at localhost:' + PORT + '!');

    }).catch((err) => {
        if(typeof(err) === Error) {
            console.log('MongoDB error: ' + err.message);
        } else {
            console.log(err);
        }
    });
}

startup();
