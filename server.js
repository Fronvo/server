// The server of Fronvo
// Shadofer#6681

// load .env
require('dotenv').config();

// Port to attach to
const PORT = process.env.PORT || 3000;

// Admin panel
const { instrument, RedisStore } = require('@socket.io/admin-ui');

// PM2
const { createAdapter } = require('@socket.io/cluster-adapter');
const { setupWorker } = require('@socket.io/sticky');

// MongoDB
const { MongoClient } = require('mongodb');

var io, mdb_client;

function setupMongoDB() {
    return new Promise((resolve, reject) => {
        const mdb_usr = process.env.FRONVO_MONGODB_USERNAME;
        const mdb_pass = process.env.FRONVO_MONGODB_PASSWORD;
        const mdb_proj = process.env.FRONVO_MONGODB_PROJECT;
        const mdb_db = process.env.FRONVO_MONGODB_DB; // optional
    
        if(!mdb_usr || !mdb_pass || !mdb_proj) {
            reject('Some MongoDB variables are missing.');
        } else {    
            console.log('Setting up MongoDB...');

            const mdb_uri = 'mongodb+srv://' + 
                            mdb_usr +
                            ':' +
                            mdb_pass +
                            '@' +
                            mdb_proj +
                            '.mongodb.net/' +
                            mdb_db || 'fronvo' +
                            '?retryWrites=true&w=majority';
    
            mdb_client = new MongoClient(mdb_uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
    
            mdb_client.connect((err) => {
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

    io.on('connection', (socket) => {
        console.log('connection');
    
        // Events
        socket.on('disconnect', (reason) => {
            console.log('disconnect');
        });
    });
    
    io.engine.on('connection_error', (err) => {
        console.log('Connection abnormally closed:  [' + err.code + ']' +  err.message);
    });

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

            // prevent invalid stats displayed
            readonly: true
        });

        console.log('Admin panel setup successfully.');
    } else {
        console.log('Admin panel setup skipped.');
    }
}

function startup() {
    console.log('Starting setup...');

    // connect requires a promise
    setupMongoDB().then(() => {
        setupServer();
        setupServerEvents();
        setupPM2();
        setupAdminPanel();

        console.log('Setup finished.');

        console.log('Server running at localhost:' + PORT);

    }).catch((err) => {
        if(typeof(err) == Error) {
            console.log('MongoDB error: ' + err.message);
        } else {
            console.log(err);
        }
    });
}

startup();
