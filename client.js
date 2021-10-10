// An optional client for the server of Fronvo, use for testing purposes
// Shadofer#6681

const PORT = process.env.PORT || 3000;

const io = require('socket.io-client');
const socket = io('ws://localhost:' + PORT, {
    // limit to websocket connections, no http polling
    transports: ['websocket']
});

console.log('Client connecting to port ' + PORT + '...');

socket.on('connect', () => {
    // prevent sending offline packets not to overflow the server
    socket.sendBuffer = [];

    console.log('Client connected, id: ' + socket.id);
});

socket.on('disconnect', () => {
    console.log('Client disconnected.');
});

socket.on('connect_error', () => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});
