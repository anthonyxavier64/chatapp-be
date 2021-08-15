import jwt from "jsonwebtoken";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
        message: 'no access token provided'
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: err.message,
        err,
      });
    }

    req.user = user;
    next();
  });
};

const generateAccessToken = (email) => {
  return jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "300d",
  });
};

const generateRefreshToken = (email) => {
  return jwt.sign(email, process.env.REFRESH_TOKEN_SECRET);
};

export default { authenticateJWT, generateAccessToken, generateRefreshToken };
