import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const verifyToken = (req, res, next) => {
  try {
    const allowedRoles = req.allowedRoles || [];
    //read token from req
    let token = req.headers.authorization?.split(" ")[1];
    if (token === undefined) {
      token = req.cookies.token;
    }
    if (token === undefined) {
      return res
        .status(401)
        .json({ message: "Unauthorized request, Please login!" });
    }
    //verify the validity of the token( decoding the token)
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!allowedRoles.includes(decodedToken.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden, you don't have permission" });
    }

    //attacg user info to req for use in routes
    req.user = decodedToken;

    //forward req to next middleware/route
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "session expired please login again" });
    }
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token.Please login again" });
    }
    next(err);
  }
};