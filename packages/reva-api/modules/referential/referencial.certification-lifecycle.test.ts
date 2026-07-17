import { CertificationStatus } from "@prisma/client";

import { STATUT_CERTIFICATION_DOIT_ETRE_ETAT_BROUILLON } from "@/modules/shared/errors/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFormaCodeHelper } from "@/test/helpers/entities/create-formacode-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

import * as SendNewCertificationAvailableToCertificationRegistryManagerEmailModule from "./emails/sendNewCertificationAvailableToCertificationRegistryManagerEmail";
import { mapToRNCPCertification, RNCPReferential } from "./rncp/referential";

it("devrait mapper les CERTIFICATEURS FC (nom uniquement) depuis une fiche brute", () => {
  const certification = mapToRNCPCertification({
    ID_FICHE: "39839",
    NUMERO_FICHE: "RNCP39839",
    INTITULE: "Test",
    CERTIFICATEURS: [
      {
        SIRET_CERTIFICATEUR: "78471719100018",
        NOM_CERTIFICATEUR:
          "UNION DES INDUSTRIES ET DES METIERS DE LA METALLURGIE - UIMM",
      },
      {
        SIRET_CERTIFICATEUR: "-",
        NOM_CERTIFICATEUR:
          "Commission Paritaire Nationale de l'Emploi de la Métallurgie",
      },
      { SIRET_CERTIFICATEUR: "00000000000000" },
    ],
  });

  expect(certification.CERTIFICATEURS).toEqual([
    {
      NOM_CERTIFICATEUR:
        "UNION DES INDUSTRIES ET DES METIERS DE LA METALLURGIE - UIMM",
    },
    {
      NOM_CERTIFICATEUR:
        "Commission Paritaire Nationale de l'Emploi de la Métallurgie",
    },
  ]);
});

it("devrait renvoyer un tableau CERTIFICATEURS vide lorsqu'ils sont absents", () => {
  const certification = mapToRNCPCertification({
    ID_FICHE: "1",
    NUMERO_FICHE: "RNCP1",
    INTITULE: "Test",
  });

  expect(certification.CERTIFICATEURS).toEqual([]);
});

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
      STATUT_CERTIFICATION_DOIT_ETRE_ETAT_BROUILLON,
    );
  },
);
