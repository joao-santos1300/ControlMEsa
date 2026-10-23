import { NextFunction, Request, Response } from "express";

type RoleName = "ADMIN" | "WAITER" | "KITCHEN";

function hasRole(...roles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Sem permissão para esta ação" });
    }
    return next();
  };
}

export { hasRole };
