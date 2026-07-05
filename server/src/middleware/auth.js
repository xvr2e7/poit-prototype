const deviceService = require("../services/deviceService");

// Optional auth middleware — attaches deviceId if token is present, but doesn't reject
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.deviceId = null;
    return next();
  }

  const token = authHeader.slice(7);
  const payload = deviceService.verifyToken(token);

  if (payload) {
    req.deviceId = payload.deviceId;
  } else {
    req.deviceId = null;
  }

  next();
};

// Required auth middleware — rejects if no valid token
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.slice(7);
  const payload = deviceService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.deviceId = payload.deviceId;
  next();
};

module.exports = { optionalAuth, requireAuth };
