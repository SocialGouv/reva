import * as jose from "jose";

export const createJwt = async (params: { sub: string; createdAt: Date }) => {
  const { sub, createdAt } = params;

  const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

  const jwt = await new jose.SignJWT()
    .setAudience("fvae-interop")
    .setIssuer(`fvae-interop-${process.env.ENVIRONMENT}`)
    .setSubject(sub)
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt(createdAt)
    .sign(secretKey);

  return jwt;
};

export const parseJwt = async (params: { token: string }) => {
  const { token } = params;

  const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

  const { payload } = await jose.jwtVerify(token, secretKey, {
    issuer: `fvae-interop-${process.env.ENVIRONMENT}`,
    requiredClaims: ["iat", "sub"],
    audience: "fvae-interop",
    algorithms: ["HS512"],

    // maxTokenAge: "1h",
  });

  return payload;
};
