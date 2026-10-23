import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
  sub: string;
  role: "ADMIN" | "WAITER" | "KITCHEN";
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers.authorization;
  if (!authToken) return res.status(401).json({ error: "Token não informado" });

  const [, token] = authToken.split(" ");
  try {
    const { sub, role } = verify(token, process.env.JWT_SECRET as string) as Payload;
    req.userId = sub;
    req.userRole = role;
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export { isAuthenticated };
