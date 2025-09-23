import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Access Token generate (short expiry)
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "60days", // 15 minutes
  });
};

// Refresh Token generate (long expiry)
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // 7 days
  });
};

// Verify Access Token middleware
export const verifyAccessToken = (req, res, next) => {
  try {
    const incomingToken = req.headers.token; // 👈 as per your pattern
    if (!incomingToken) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Token not Found",
        result: {},
      });
    }

    const decoded = jwt.verify(incomingToken, process.env.JWT_ACCESS_SECRET);
    if (!decoded) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized Access, Please login",
        result: {},
      });
    }

    req.token = decoded; // 👈 ab har route me req.token available
    next();
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in verifyAccessToken",
      result: {},
    });
  }
};

// Verify Refresh Token (for new access token)
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};
