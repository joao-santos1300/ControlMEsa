"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.emitToKitchen = emitToKitchen;
exports.emitToWaiter = emitToWaiter;
const jsonwebtoken_1 = require("jsonwebtoken");
const socket_io_1 = require("socket.io");
let io = null;
function initSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error("Token não informado"));
        try {
            const { sub, role } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            socket.data.userId = sub;
            socket.data.role = role;
            return next();
        }
        catch {
            return next(new Error("Token inválido"));
        }
    });
    io.on("connection", (socket) => {
        const { userId, role } = socket.data;
        if (role === "KITCHEN" || role === "ADMIN")
            socket.join("kitchen");
        if (role === "WAITER")
            socket.join(`waiter:${userId}`);
    });
}
function emitToKitchen(event, payload) {
    io?.to("kitchen").emit(event, payload);
}
function emitToWaiter(waiterId, event, payload) {
    io?.to(`waiter:${waiterId}`).emit(event, payload);
}
