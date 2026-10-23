"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const discovery_1 = require("./discovery");
const routes_1 = require("./routes");
const socket_1 = require("./socket");
const port = Number(process.env.PORT) || 3333;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Público: os apps usam para confirmar que acharam o servidor certo
app.get("/server-info", (req, res) => {
    res.json((0, discovery_1.serverInfo)(port, req.socket.remoteAddress?.replace(/^::ffff:/, "")));
});
app.use(routes_1.router);
app.use((err, req, res, next) => {
    if (err instanceof Error) {
        return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
});
const httpServer = (0, http_1.createServer)(app);
(0, socket_1.initSocket)(httpServer);
httpServer.listen(port, "0.0.0.0", () => {
    (0, discovery_1.printServerAddresses)(port);
    (0, discovery_1.startDiscoveryResponder)(port);
});
