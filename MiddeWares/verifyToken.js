import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const verifyToken = async (req, res, next) => {
  //read token from req
  let token = req.cookies.token; //{ token :""}
  if (token === undefined) {
    return res.status(400).json({ message: "Unauthorized request Please login!" });
  }
  //verify the validity of the token( decoding the token)
  let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedToken

  //forward req to next middleware/route
  next();
};