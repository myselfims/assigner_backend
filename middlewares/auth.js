import JWT from "jsonwebtoken";

const auth = (admin = false) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]; // Correct way to access headers
    console.log('private key is : ',process.env.jwtPrivateKey)
    if (!token) {
      return res.status(401).send("Token is not provided!");
    }

    try {
      const user = JWT.verify(token, process.env.jwtPrivateKey); // Use environment variable for secret key
      if (admin && !user.isAdmin) {
        return res.status(403).send("Unauthorized!");
      }
      req.user = user;
      next();
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      res.status(400).send("Invalid token!");
    }
  };
};

export default auth;
