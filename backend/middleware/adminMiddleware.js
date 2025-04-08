const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 1) {
      return res.status(403).json({ message: "Access Denied. Admins only." });
    }
    next();
  };
  
  module.exports = adminMiddleware;