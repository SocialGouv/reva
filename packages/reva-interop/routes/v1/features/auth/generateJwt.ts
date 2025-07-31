import { createJwt } from "../../../../utils/jwt.js";
import { createSession } from "../session/createSession.js";

export const generateJwt = async (params: { keycloakId: string }) => {
  const { keycloakId } = params;

  const session = await createSession({ keycloakId });

  const jwt = await createJwt({
    sub: session.id,
    createdAt: session.createdAt,
  });

  return jwt;
};
