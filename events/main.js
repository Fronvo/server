const registerAccountEvents = require('./account');
const registerGeneralEvents = require('./general');
const utilities = require('../other/utilities');

module.exports = (io, mdb) => {
    io.on('connection', (socket) => {
        console.log('Socket ' + socket.id + ' has connected.');

        registerAccountEvents(socket, mdb);
        registerGeneralEvents(socket, mdb);

        socket.on('disconnect', () => {
            if(utilities.isSocketLoggedIn(socket)) {
                utilities.logoutSocket(socket);
            }
            
            console.log('Socket ' + socket.id + ' has disconnected.');
        });
    });
    
    io.engine.on('connection_error', (err) => {
        console.log('Connection abnormally closed:  [' + err.code + ']' +  err.message);
    });
}
