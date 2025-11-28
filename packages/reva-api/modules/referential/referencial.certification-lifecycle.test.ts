import { CertificationStatus } from "@prisma/client";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFormaCodeHelper } from "@/test/helpers/entities/create-formacode-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

import * as SendNewCertificationAvailableToCertificationRegistryManagerEmailModule from "./emails/sendNewCertificationAvailableToCertificationRegistryManagerEmail";
import { RNCPReferential } from "./rncp/referential";

it("should create a new certification in the 'BROUILLON' status", async () => {
  const myFormaCode = await createFormaCodeHelper();
  const uniqueRncp = `RNCP${Date.now()}`; // Generate unique RNCP code

  vi.spyOn(RNCPReferential, "getInstance").mockImplementation(
    () =>
      ({
        findOneByRncp: () => ({
          ID_FICHE: uniqueRncp,
          NUMERO_FICHE: uniqueRncp,
          INTITULE: uniqueRncp,
          BLOCS_COMPETENCES: [],
          FORMACODES: [{ CODE: myFormaCode.code }],
          PREREQUIS: { PARSED_PREREQUIS: [], LISTE_PREREQUIS: "" },
          DATE_FIN_ENREGISTREMENT: new Date(),
          NOMENCLATURE_EUROPE: { INTITULE: "Niveau 4" },
        }),
      }) as unknown as RNCPReferential,
  );

  const response = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "referential_addCertification",
      arguments: { input: { codeRncp: uniqueRncp } },
      returnFields: "{status}",
    },
  });
  expect(response.json()).not.toHaveProperty("errors");
  expect(response.json().data.referential_addCertification.status).toBe(
    "BROUILLON",
  );
});

it("should send a certification to the certification registry manager if the certification status is 'BROUILLON'", async () => {
  const certification = await createCertificationHelper({
    status: "BROUILLON",
  });

  const certificationRegistryManagerMailSpy = vi
    .spyOn(
      SendNewCertificationAvailableToCertificationRegistryManagerEmailModule,
      "sendNewCertificationAvailableToCertificationRegistryManagerEmail",
    )
    .mockImplementation(() => Promise.resolve());

  const response = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "referential_sendCertificationToRegistryManager",
      arguments: { input: { certificationId: certification.id } },
      returnFields: "{status}",
    },
  });
  expect(response.json()).not.toHaveProperty("errors");
  expect(
    response.json().data.referential_sendCertificationToRegistryManager.status,
  ).toBe("A_VALIDER_PAR_CERTIFICATEUR");
  expect(certificationRegistryManagerMailSpy).toHaveBeenCalled();
});

test.each([
  "A_VALIDER_PAR_CERTIFICATEUR",
  "VALIDE_PAR_CERTIFICATEUR",
  "INACTIVE",
] satisfies CertificationStatus[])(
  "should throw an error when trying to send a certification to the certification registry manager when the certification status is  %s",
  async (status: CertificationStatus) => {
    const certification = await createCertificationHelper({
      status,
    });
    const response = await injectGraphql({
      fastify: global.testApp,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
      }),
      payload: {
        requestType: "mutation",
        endpoint: "referential_sendCertificationToRegistryManager",
        arguments: { input: { certificationId: certification.id } },
        returnFields: "{status}",
      },
    });
    expect(response.json()).toHaveProperty("errors");
    expect(response.json().errors[0].message).toBe(
      "Le statut de la certification doit être à l'état 'Brouillon'",
    );
  },
);
