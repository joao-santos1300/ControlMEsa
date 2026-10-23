import { Server as HttpServer } from "http";
import { verify } from "jsonwebtoken";
import { Server } from "socket.io";

interface Payload {
  sub: string;
  role: "ADMIN" | "WAITER" | "KITCHEN";
}

let io: Server | null = null;

function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, { cors: { origin: "*" } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Token não informado"));
    try {
      const { sub, role } = verify(token, process.env.JWT_SECRET as string) as Payload;
      socket.data.userId = sub;
      socket.data.role = role;
      return next();
    } catch {
      return next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.data as { userId: string; role: string };
    if (role === "KITCHEN" || role === "ADMIN") socket.join("kitchen");
    if (role === "WAITER") socket.join(`waiter:${userId}`);
  });
}

function emitToKitchen(event: string, payload: unknown) {
  io?.to("kitchen").emit(event, payload);
}

function emitToWaiter(waiterId: string, event: string, payload: unknown) {
  io?.to(`waiter:${waiterId}`).emit(event, payload);
}

export { initSocket, emitToKitchen, emitToWaiter };
