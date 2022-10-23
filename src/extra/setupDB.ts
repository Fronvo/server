// ******************** //
// The extra utility script to setup a Fronvo Mongo database before use.
// ******************** //

const PORT = parseInt(process.env.PORT) || 3001;

// Custom event files
import registerEvents from 'events/main';

// Cool-ish styling
import gradient from 'gradient-string';
import ora, { Ora } from 'ora';

// Other imports
import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server } from 'socket.io';
import { io, Socket } from 'socket.io-client';
import { generateEmail, generatePassword } from 'test/utilities';
import * as variables from 'variables/global';
import { getEnvBoolean } from 'variables/varUtils';

// Variables
let ioObject: Server<ClientToServerEvents, ServerToClientEvents>;
let socket: Socket<ServerToClientEvents, ClientToServerEvents>;
let loadingSpinner: Ora;
const loadingSpinnerDefaultText = 'Setting up database';
const officialEmail = generateEmail();
const officialPassword = generatePassword();

function setLoading(currProcText: string): void {
    loadingSpinner.text = loadingSpinnerDefaultText + ': ' + currProcText;
}

function preStartupChecks(): void {
    function checkSilentLogging() {
        if (variables.silentLogging) console.log = () => {};
    }

    checkSilentLogging();
}

function setupServer(): void {
    setLoading('Setting up the server process, server events and admin panel');

    // Setup the socket.io server with tailored options
    ioObject = new Server<ClientToServerEvents, ServerToClientEvents>(PORT, {
        serveClient: false,
        path: '/fronvo',

        // Admin panel
        cors: {
            origin: ['https://admin.socket.io'],
            credentials: true,
        },

        // Enable / Disable binary parser
        parser: getEnvBoolean('BINARY_PARSER', false)
            ? require('socket.io-msgpack-parser')
            : '',

        // No namespace detected, disconnect
        connectTimeout: 5000,

        // Disable HTTPS requests
        httpCompression: false,
        maxHttpBufferSize: 0,

        // Strict pong timeout
        pingTimeout: 5000,

        // Limit to websocket connections
        transports: ['websocket'],
    });
}

function setupServerEvents(): void {
    registerEvents(ioObject);
}

async function setupOperations(): Promise<void> {
    setLoading('Warming up');

    // Prepare for requests before-hand, prevent cold requests
    const tempLog = await variables.prismaClient.log.create({
        data: {
            info: 'Temporary log, to be deleted.',
        },
    });

    // Read operations aswell
    await variables.prismaClient.log.findMany();

    // Update operations
    await variables.prismaClient.log.update({
        where: { id: tempLog.id },
        data: {
            info: 'Updated temporary log, to be deleted.',
        },
    });

    // And delete operations
    await variables.prismaClient.log.delete({ where: { id: tempLog.id } });
}

function setupSocket(): void {
    socket = io(`ws://localhost:${PORT}`, {
        transports: ['websocket'],
        path: '/fronvo',
        reconnectionDelay: 100,
        reconnectionDelayMax: 200,
        reconnectionAttempts: 10,
        randomizationFactor: 0,
    });
}

async function setupDB(): Promise<void> {
    setLoading('Creating structure');

    // Sanity check before destroying someone's database
    const createdAccounts = await variables.prismaClient.account.count({});

    if (createdAccounts > 0) {
        loadingSpinner.fail("Can't setup an already setup database.");
        process.exit(1);
    }

    async function createOfficialAccount(): Promise<void> {
        return new Promise((resolve) => {
            socket.emit(
                'register',
                { email: officialEmail, password: officialPassword },
                () => {
                    socket.emit('registerVerify', { code: '123456' }, () => {
                        socket.emit(
                            'updateProfileData',
                            {
                                profileId: 'fronvo',
                                username: 'Fronvo',
                                bio: 'The official account of Fronvo',
                            },
                            () => resolve()
                        );
                    });
                }
            );
        });
    }

    async function createOfficialPost(): Promise<void> {
        return new Promise((resolve) => {
            socket.emit(
                'createPost',
                {
                    title: 'Welcome to Fronvo',
                    content: `Never be tracked again.
Ads..?
What are those?`,
                    attachment:
                        'https://github.com/Fronvo/server/blob/master/.github/email/fronvo-logo-large.png?raw=true',
                },
                () => resolve()
            );
        });
    }

    async function createOfficialWarningPost(): Promise<void> {
        return new Promise((resolve) => {
            socket.emit(
                'createPost',
                {
                    title: 'Official Account Warning',
                    content: `This account, post and community have been auto-generated.
Someone must first login to this account before trying to self-host this server instance.
Other than that, have fun!`,
                    attachment:
                        'https://github.com/Fronvo/server/blob/master/.github/email/fronvo-logo-large.png?raw=true',
                },
                () => resolve()
            );
        });
    }

    async function createOfficialCommunity(): Promise<void> {
        return new Promise((resolve) => {
            socket.emit(
                'createCommunity',
                {
                    name: 'Fronvo',
                    description: 'The official community of Fronvo.',
                    icon: 'https://i.ibb.co/QFT7SNj/logo.png',
                },
                () => {
                    socket.emit(
                        'updateCommunityData',
                        {
                            communityId: 'fronvo',
                        },
                        () => {
                            resolve();
                        }
                    );
                }
            );
        });
    }

    await createOfficialAccount();
    await createOfficialPost();
    await createOfficialWarningPost();
    await createOfficialCommunity();
}

async function startup(): Promise<void> {
    preStartupChecks();

    // Gradient shenanigans
    console.log(
        gradient([
            '#e8128f',
            '#e812d2',
            '#e412e8',
            '#cb12e8',
            '#bd12e8',
            '#a812e8',
            '#8f12e8',
            '#8012e8',
        ])(`Fronvo DB utility`)
    );

    loadingSpinner = ora({
        text: loadingSpinnerDefaultText,
        spinner: 'dots12', // wonky windows 10 style
        interval: 40,
        color: 'magenta',
    }).start();

    // Attempt to run each check one-by-one
    setupServer();
    setupServerEvents();
    setupSocket();
    await setupOperations();
    await setupDB();

    socket.disconnect();

    loadingSpinner.succeed(
        `Email: ${officialEmail}, Password: ${officialPassword}`
    );
}

startup();
