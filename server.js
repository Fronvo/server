// The server of Fronvo
// Shadofer#6681

// load .env
require('dotenv').config();

// given port/set
const PORT = process.env.PORT || 3000;

// admin panel
const { instrument, RedisStore } = require('@socket.io/admin-ui');

// load balancing
const { createAdapter } = require('@socket.io/cluster-adapter');
const { setupWorker } = require('@socket.io/sticky');

const io = require('socket.io')(PORT, {
    wsEngine: require('eiows').Server,

    // admin panel
    cors: {
        origin: ['https://admin.socket.io'],
        credentials: true
    }
});

// setup admin panel, if keys exist
const panel_usr = process.env.ADMIN_PANEL_USERNAME;
const panel_pass = process.env.ADMIN_PANEL_PASSWORD;

// setup admin panel
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
    console.log('Skipped admin panel setup.');
}

// setup PM2
if(process.env.TARGET_PM2) {
    io.adapter(createAdapter());
    setupWorker(io);

    console.log('PM2 enabled.')
}

console.log('Server started at port: ' + PORT);

function showOnline() {
    console.log('Connected clients: ' + io.engine.clientsCount);
}

io.on('connection', socket => {
    showOnline();

    socket.on('disconnect', (reason) => {
        showOnline();
    });
});

io.engine.on('connection_error', (err) => {
    console.log('Connection abnormally closed:  [' + err.code + '] ' +  err.message);
});
