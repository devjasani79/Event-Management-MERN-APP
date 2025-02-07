const validateEventAccess = (req, res, next) => {
    if (!req.user || !req.user.isVerified) {
      return res.status(403).json({ message: "Access denied. Please verify your email to manage events." });
    }
    next();
  };
  
  module.exports = validateEventAccess;
  