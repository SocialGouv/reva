import { prismaClient } from "@/prisma/client";

import { FRANCE_CONNECT_SANDBOX_EMAILS } from "./franceConnectSandboxEmails.constant";
import { getFranceConnectSandboxCandidates } from "./getFranceConnectSandboxCandidates";

describe("getFranceConnectSandboxCandidates", () => {
  test("retourne uniquement les candidats sandbox présents en base", async () => {
    const candidatesInDb = [
      {
        id: "id-1",
        email: FRANCE_CONNECT_SANDBOX_EMAILS[0],
        firstname: "Jean",
        lastname: "Dupont",
      },
      {
        id: "id-2",
        email: FRANCE_CONNECT_SANDBOX_EMAILS[4],
        firstname: "Marie",
        lastname: "Martin",
      },
    ];

    const findManySpy = vi
      .spyOn(prismaClient.candidate, "findMany")
      .mockResolvedValue(candidatesInDb as never);

    const result = await getFranceConnectSandboxCandidates();

    expect(findManySpy).toHaveBeenCalledTimes(1);
    expect(findManySpy).toHaveBeenCalledWith({
      where: { email: { in: [...FRANCE_CONNECT_SANDBOX_EMAILS] } },
      orderBy: { email: "asc" },
    });

    expect(result).toEqual(candidatesInDb);

    // La liste blanche doit rester figée à 35 emails.
    expect(FRANCE_CONNECT_SANDBOX_EMAILS.length).toBe(35);
  });
});
