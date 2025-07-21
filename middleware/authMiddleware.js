import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth header:", authHeader ? "Present" : "Missing");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, "secret_key");
      req.user = { _id: decoded.id };
      console.log("User authenticated:", req.user._id);
      next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    console.error("No valid authorization header");
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

