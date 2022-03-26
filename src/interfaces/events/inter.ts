// ******************** //
// Interfaces for the inter-server events of Socket.IO
// ******************** //

export interface InterServerEvents {
    loginSocket: (socketId: string, accountId: string) => void;
    logoutSocket: (socketId: string) => void;
}
