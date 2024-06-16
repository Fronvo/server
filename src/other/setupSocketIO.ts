import { Server, Socket } from "socket.io";
import {
  addAssociatedSocket,
  prismaClient,
  removeAssociatedSocket,
  server,
  setServer,
} from "../vars";
import binaryParser from "socket.io-msgpack-parser";
import jwt from "jsonwebtoken";

async function authenticateSocket(
  socket: Socket,
  path: string
): Promise<string> {
  return new Promise((resolve) => {
    const header = socket.handshake.query["authorization"] as string;

    if (!header) {
      console.log(`[${path}]: No auth`);

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
          console.log(`[${path}]: Invalid auth`);

          socket.disconnect();

          return;
        }

        const id = (decoded as { id: string }).id;

        const userObj = await prismaClient.accounts.findUnique({
          where: {
            profile_id: id,
          },
        });

        // Deleted account most likely, reject
        if (!userObj) {
          console.log(`[${path}]: Account not found`);

          socket.disconnect();

          return;
        }

        console.log(`[${path}]: ${id}`);

        addAssociatedSocket(socket.id, id);

        resolve(id);
      }
    );
  });
}

export default function setupSocketIO(httpServer: any): void {
  setServer(
    new Server(httpServer, {
      transports: ["websocket"],
      serveClient: false,
      parser: binaryParser,
    })
  );

  // Only allow connections on namespaces
  server.on("connection", (socket) => socket.disconnect());

  // Profile-related updates
  server.of("/profiles").on("connection", async (socket) => {
    const userId = await authenticateSocket(socket, "/profiles");

    if (!userId) return;

    // Self channel for when over 1 socket is on the same account
    socket.join(userId);

    socket.on("disconnect", async () => {
      removeAssociatedSocket(socket.id);
    });
  });
}
