// ******************** //
// Interfaces for the inter-server events of Socket.IO
// ******************** //

export interface InterServerEvents {
    loginSocket: ({}: InterLoginSocket) => void;
    logoutSocket: ({}: InterLogoutSocket) => void;
}

export interface InterLoginSocket {
    socketId: string;
    socketIP: string;
    accountId: string;
}

export interface InterLogoutSocket {
    socketId: string;
}
