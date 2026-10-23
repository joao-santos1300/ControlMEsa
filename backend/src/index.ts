import "dotenv/config";
import "express-async-errors";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import { printServerAddresses, serverInfo, startDiscoveryResponder } from "./discovery";
import { router } from "./routes";
import { initSocket } from "./socket";

const port = Number(process.env.PORT) || 3333;
const app = express();
app.use(express.json());
app.use(cors());

// Público: os apps usam para confirmar que acharam o servidor certo
app.get("/server-info", (req, res) => {
  res.json(serverInfo(port, req.socket.remoteAddress?.replace(/^::ffff:/, "")));
});

app.use(router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: "Erro interno do servidor" });
});

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, "0.0.0.0", () => {
  printServerAddresses(port);
  startDiscoveryResponder(port);
});
