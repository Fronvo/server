// ******************** //
// Interfaces for the inter-server events of Socket.IO
// ******************** //

export interface InterServerEvents {
    updateRateLimit: (socketIP: string, pointsToConsume: number) => void;
    loginSocket: (socketId: string, accountId: string) => void;
    logoutSocket: (socketId: string) => void;
}
