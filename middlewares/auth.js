import JWT from "jsonwebtoken";

const auth = (admin = false) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]; // Correct way to access headers
    if (!token) {
      return res.status(401).send("Token is not provided!");
    }

    try {
      const user = JWT.verify(token, "Imran@12"); // Use environment variable for secret key
      req.user = user;
      console.log("user is " , user)
      next();
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      res.status(400).send("Invalid token!");
    }
  };
};

export default auth;
