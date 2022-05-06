// ******************** //
// Interfaces for the inter-server events of Socket.IO
// ******************** //

export interface InterServerEvents {
    updateRateLimit: ({}: InterUpdateRateLimit) => void;
    loginSocket: ({}: InterLoginSocket) => void;
    logoutSocket: ({}: InterLogoutSocket) => void;
}

export interface InterUpdateRateLimit {
    socketIP: string;
    pointsToConsume: number;
}

export interface InterLoginSocket {
    socketId: string;
    accountId: string;
}

export interface InterLogoutSocket {
    socketId: string;
}
