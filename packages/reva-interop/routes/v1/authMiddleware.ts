import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";
import * as jose from "jose";

dotenv.config({ path: "./.env" });

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

export const validateJwt = async (
  request: FastifyRequest,
  _reply: FastifyReply,
) => {
  if (request.url === "/v1/docs" || request.url === "/v1/schema.json") {
    return;
  }
  const jwt =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmdmFlLWludGVyb3AtYXNwIiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNzE2MjM5MDIyfQ.Z7wZ5z-TlG9R1SUI-oGcfFs_H3TGze-Xpc-8yUlV7SERCPuVwmpkyQTd273p6-2LyoJooehefZBIC-kt43hfzg";

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, secretKey, {
    issuer: "fvae-interop-asp",
    requiredClaims: ["iat", "exp", "sub"],
    // maxTokenAge: "1h",
  });

  console.log(protectedHeader);
  console.log(payload);
};
