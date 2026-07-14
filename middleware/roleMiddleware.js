module.exports = (...roles) => {

  return (req, res, next) => {

    try {

      // =========================
      // CHECK USER ROLE
      // =========================

      if (!req.user) {

        return res.status(401).json({
          message: "Unauthorized"
        });

      }

      // =========================
      // ROLE VALIDATION
      // =========================

      if (!roles.includes(req.user.role)) {

        return res.status(403).json({
          message: "Access Denied"
        });

      }

      next();

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server Error"
      });

    }

  };

};