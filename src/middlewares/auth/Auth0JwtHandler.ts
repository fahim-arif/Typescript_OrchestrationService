import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import * as dotenv from "dotenv";

dotenv.config();

// This handler will take care of jwts returned from Auth0
export const checkAuth0Jwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    /* global process */
    jwksUri: `${process.env.AUTH0_ISSUER}.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `${process.env.AUTH0_ISSUER}`,
  algorithms: ["RS256"],
});
