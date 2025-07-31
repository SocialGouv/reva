import { parseJwt } from "../../../../utils/jwt.js";
import { closeSessionById } from "../session/closeSessionById.js";
import { findSessionById } from "../session/findSessionById.js";

export const invalidJwt = async (params: { token: string }) => {
  const { token } = params;

  const payload = await parseJwt({ token });

  const sessionId = payload.sub;
  if (!sessionId) {
    return;
  }

  const session = await findSessionById(sessionId);
  if (!session) {
    return;
  }

  if (session.endedAt) {
    return;
  }

  await closeSessionById(sessionId);
};
