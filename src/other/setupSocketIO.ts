import { Server, Socket } from "socket.io";
import {
  addAssociatedSocket,
  prismaClient,
  removeAssociatedSocket,
  server,
  setServer,
} from "../vars";
import jwt from "jsonwebtoken";
import { accounts, servers } from "@prisma/client";

interface AccountWithServers extends Partial<accounts> {
  servers: servers[];
}

async function authenticateSocket(
  socket: Socket,
  path: string
): Promise<AccountWithServers> {
  return new Promise((resolve) => {
    const header = socket.handshake.query["authorization"] as string;

    if (!header) {
      socket.disconnect();

      return;
    }

    const secret = process.env.JWT_SECRET;
    const token = header.split(" ")[1];

    jwt.verify(
      token,
      secret,
      {
        algorithms: ["HS256"],
      },
      async (err, decoded) => {
        if (err) {
          socket.disconnect();

          return;
        }

        const id = (decoded as { id: string }).id;

        const user = await prismaClient.accounts.findUnique({
          where: {
            id: id,
          },

          include: {
            servers: true
          }
        });

        // Deleted account most likely, reject
        if (!user) {
          socket.disconnect();

          return;
        }

        addAssociatedSocket({
          socketId: socket.id,
          accountId: id,
        });

        resolve(user);
      }
    );
  });
}

export default function setupSocketIO(httpServer: any): void {
  setServer(
    new Server(httpServer, {
      transports: ["websocket"],
      serveClient: false,
    })
  );

  // Only allow connections on namespaces
  server.on("connection", (socket) => socket.disconnect());

  // Profile-related updates
  server.of("/profiles").on("connection", async (socket) => {
    const user = await authenticateSocket(socket, "/profiles");

    if (!user) return;

    // Self channel for when over 1 socket is on the same account
    socket.join(user.id);

    socket.on("disconnect", async () => {
      removeAssociatedSocket(socket.id);
    });
  });

  // Server-related updates
  server.of("/servers").on("connection", async (socket) => {
    const user = await authenticateSocket(socket, "/profiles");

    if (!user) return;

    // Self channel for when over 1 socket is on the same account
    socket.join(user.id);

    for(const server of user.servers) {
      socket.join(server.id);
    }

    socket.on("disconnect", async () => {
      removeAssociatedSocket(socket.id);
    });
  });

  // DM-related updates
  server.of("/dms").on("connection", async (socket) => {
    const user = await authenticateSocket(socket, "/profiles");

    if (!user) return;

    // Self channel for when over 1 socket is on the same account
    socket.join(user.id);

    socket.on("disconnect", async () => {
      removeAssociatedSocket(socket.id);
    });
  });
}
