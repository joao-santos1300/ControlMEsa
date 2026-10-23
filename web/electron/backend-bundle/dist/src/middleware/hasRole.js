"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = hasRole;
function hasRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ error: "Sem permissão para esta ação" });
        }
        return next();
    };
}
