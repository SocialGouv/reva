import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  sanitizedEmail,
  sanitizedPhone,
  sanitizedSiret,
  sanitizedText,
} from "@/utils/input-sanitization";

import { graphql } from "@/graphql/generated";
import {
  MaisonMereAap,
  UpdateMaisonMereLegalInformationInput,
} from "@/graphql/generated/graphql";

const generalInformationQueries = graphql(`
  query getAccountMaisonMereGeneralInformation {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
        siret
        phone
        managerFirstname
        managerLastname
        statutValidationInformationsJuridiquesMaisonMereAAP
        typologie
        legalInformationDocumentsDecisions(
          input: { decision: DEMANDE_DE_PRECISION }
        ) {
          id
          aapComment
          decisionTakenAt
        }
        gestionnaire {
          firstname
          lastname
          email
        }
      }
    }
  }
`);

const getEtablissementQuery = graphql(`
  query getEtablissementForAgenciesSettings($siret: ID!) {
    getEtablissement(siret: $siret) {
      siret
      raisonSociale
      formeJuridique {
        code
        libelle
        legalStatus
      }
      siegeSocial
      dateFermeture
      qualiopiStatus
    }
  }
`);

const getMaisonMereAAPGeneralInformationAdminQuery = graphql(`
  query getMaisonMereAAPGeneralInformationAdmin($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      siret
      phone
      managerFirstname
      managerLastname
      statutValidationInformationsJuridiquesMaisonMereAAP
      typologie
      legalInformationDocumentsDecisions(
        input: { decision: DEMANDE_DE_PRECISION }
      ) {
        id
        aapComment
        decisionTakenAt
      }
      gestionnaire {
        firstname
        lastname
        email
      }
      organisms {
        modaliteAccompagnement
        accounts {
          id
        }
        remoteZones
      }
    }
  }
`);

const updateMaisonMereLegalInformationMutation = graphql(`
  mutation updateMaisonMereLegalInformation(
    $data: UpdateMaisonMereLegalInformationInput!
  ) {
    organism_updateMaisonMereLegalInformation(data: $data)
  }
`);

const schema = z.object({
  siret: sanitizedSiret(),
  managerFirstname: sanitizedText(),
  managerLastname: sanitizedText(),
  gestionnaireFirstname: sanitizedText(),
  gestionnaireLastname: sanitizedText(),
  gestionnaireEmail: sanitizedEmail(),
  phone: sanitizedPhone(),
  gestionBranch: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export const useGeneralInformationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { "maison-mere-id": maisonMereAAPId }: { "maison-mere-id": string } =
    useParams();
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();

  const { mutateAsync: updateMaisonMereLegalInformation } = useMutation({
    mutationFn: (data: UpdateMaisonMereLegalInformationInput) =>
      graphqlClient.request(updateMaisonMereLegalInformationMutation, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [maisonMereAAPId] });
    },
  });

  const {
    data: generalInformationsResponse,
    status: generalInformationsStatus,
  } = useQuery({
    queryKey: [maisonMereAAPId, "maisonMereAAP", "GeneralInformationPage"],
    queryFn: () => graphqlClient.request(generalInformationQueries),
    enabled: !isAdmin,
  });

  const {
    data: maisonMereAAPGeneralInformationResponse,
    status: maisonMereAAPGeneralInformationStatus,
  } = useQuery({
    queryKey: [maisonMereAAPId, "maisonMereAAP", "GeneralInformationPage"],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPGeneralInformationAdminQuery, {
        maisonMereAAPId,
      }),
    enabled: isAdmin,
  });

  const maisonMereAAPSuccess =
    maisonMereAAPGeneralInformationStatus === "success" ||
    generalInformationsStatus === "success";
  const maisonMereAAPError =
    maisonMereAAPGeneralInformationStatus === "error" ||
    generalInformationsStatus === "error";

  let maisonMereAAP: MaisonMereAap | undefined;
  if (isAdmin) {
    maisonMereAAP =
      maisonMereAAPGeneralInformationResponse?.organism_getMaisonMereAAPById as MaisonMereAap;
  } else {
    maisonMereAAP = generalInformationsResponse
      ?.account_getAccountForConnectedUser?.maisonMereAAP as MaisonMereAap;
  }

  const defaultValues = useMemo(
    () => ({
      siret: maisonMereAAP?.siret,
      managerFirstname: maisonMereAAP?.managerFirstname ?? "",
      managerLastname: maisonMereAAP?.managerLastname ?? "",
      gestionnaireFirstname: maisonMereAAP?.gestionnaire?.firstname ?? "",
      gestionnaireLastname: maisonMereAAP?.gestionnaire?.lastname ?? "",
      gestionnaireEmail: maisonMereAAP?.gestionnaire?.email ?? "",
      phone: maisonMereAAP?.phone ?? "",
      gestionBranch:
        maisonMereAAP?.typologie === "expertBrancheEtFiliere" ||
        maisonMereAAP?.typologie === "expertBranche",
    }),
    [maisonMereAAP],
  );

  const formHook = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const { watch, reset } = formHook;

  const handleReset = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const siret = watch("siret");

  const { data: getEtablissementData } = useQuery({
    queryKey: [siret],
    queryFn: () =>
      graphqlClient.request(getEtablissementQuery, {
        siret: siret || "",
      }),
    enabled: !!siret && siret?.length >= 14,
  });

  const etablissement = getEtablissementData?.getEtablissement;
  return {
    generalInformationsResponse,
    maisonMereAAPSuccess,
    maisonMereAAPError,
    maisonMereAAP,
    maisonMereAAPId,
    etablissement,
    isGestionnaireMaisonMereAAP,
    isAdmin,
    siret,
    formHook,
    handleReset,
    updateMaisonMereLegalInformation,
  };
};
