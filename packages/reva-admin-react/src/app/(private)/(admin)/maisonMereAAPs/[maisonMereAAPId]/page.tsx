"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { useQuery } from "@tanstack/react-query";
import { format, toDate } from "date-fns";
import { useParams } from "next/navigation";

import {
  AccountInfoRows,
  pendingIfChanged,
} from "@/app/(private)/(aap)/agencies-settings-v3/[maison-mere-id]/general-information/_components/AccountInfoRows";
import { InfoRow } from "@/app/(private)/(aap)/agencies-settings-v3/[maison-mere-id]/general-information/_components/InfoRow";
import { LegalInformationTile } from "@/app/(private)/(aap)/agencies-settings-v3/[maison-mere-id]/general-information/_components/LegalInformationTile";
import { SiretInformationCard } from "@/app/(private)/(aap)/agencies-settings-v3/[maison-mere-id]/general-information/_components/SiretInformationCard";
import { useEtablissement } from "@/components/company-preview/CompanyPreview.hooks";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { LegalDocumentList } from "@/components/legal-document-list/LegalDocumentList";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { PREVIEW_URL_REFETCH_INTERVAL_MS } from "@/constants/previewUrl.constant";
import { formatSiret } from "@/utils/formatSiret";

import { graphql } from "@/graphql/generated";

import { MandatairesSociauxCard } from "./(components)/MandatairesSociauxCard";
import ValidationDecisionForm from "./(components)/ValidationDecisionForm";

const getMaisonMereAAP = graphql(`
  query getMaisonMereAAPById($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      phone
      siret
      raisonSociale
      createdAt
      statutValidationInformationsJuridiquesMaisonMereAAP
      managerFirstname
      managerLastname
      legalInformationDocuments {
        createdAt
        managerFirstname
        managerLastname
        siret
        gestionnaireFirstname
        gestionnaireLastname
        gestionnaireEmail
        phone
        attestationURSSAFFile {
          previewUrl
        }
        justificatifIdentiteDirigeantFile {
          previewUrl
        }
        lettreDeDelegationFile {
          previewUrl
        }
        justificatifIdentiteDelegataireFile {
          previewUrl
        }
      }
      legalInformationDocumentsDecisions(
        input: { decision: DEMANDE_DE_PRECISION }
      ) {
        id
        decisionTakenAt
      }
      gestionnaire {
        firstname
        lastname
        email
      }
    }
  }
`);

const MaisonMereAAPPage = () => {
  const { maisonMereAAPId }: { maisonMereAAPId: string } = useParams();

  const { graphqlClient } = useGraphQlClient();
  const { isFeatureActive } = useFeatureflipping();

  const { data: getMaisonMereAAPResponse, isLoading: isMaisonMereAAPLoading } =
    useQuery({
      queryKey: ["getMaisonMereAAP", maisonMereAAPId],
      refetchInterval: PREVIEW_URL_REFETCH_INTERVAL_MS,
      queryFn: () =>
        graphqlClient.request(getMaisonMereAAP, {
          maisonMereAAPId,
        }),
    });

  const maisonMereAAP = getMaisonMereAAPResponse?.organism_getMaisonMereAAPById;

  const { etablissement } = useEtablissement(maisonMereAAP?.siret);

  if (isMaisonMereAAPLoading || !maisonMereAAP) {
    return <></>;
  }

  const isAwaitingVerification =
    maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP ===
    "EN_ATTENTE_DE_VERIFICATION";

  // Hors vérification en cours, la demande a été traitée: ni avant/après, ni pièces jointes.
  const legalInformationDocuments = isAwaitingVerification
    ? maisonMereAAP.legalInformationDocuments
    : null;

  // Les décisions sont triées de la plus récente à la plus ancienne côté API.
  const lastUpdateRequest = maisonMereAAP.legalInformationDocumentsDecisions[0];

  const pendingSiret = pendingIfChanged(
    maisonMereAAP.siret,
    legalInformationDocuments?.siret,
  );

  return (
    <div className="flex flex-col flex-1 px-8 py-4">
      <SettingsBreadcrumb
        currentPageLabel={maisonMereAAP.raisonSociale}
        homeLinkProps={{ href: "/" }}
        segments={[
          {
            label: "Vérifications",
            linkProps: { href: "/subscriptions/check-legal-information" },
          },
        ]}
      />
      <h1>{maisonMereAAP.raisonSociale}</h1>
      <p className="mb-1">
        Inscrit depuis le :{" "}
        {format(toDate(maisonMereAAP.createdAt), "dd/MM/yyyy")}
      </p>
      {legalInformationDocuments && (
        <p className="mb-1">
          Demande de modification envoyée le :{" "}
          {format(toDate(legalInformationDocuments.createdAt), "dd/MM/yyyy")}
        </p>
      )}
      <div className="flex flex-col gap-6 mt-6">
        <InfoRow
          label="Numéro de SIRET"
          badge={
            pendingSiret && (
              <Badge severity="info" small>
                Modifié
              </Badge>
            )
          }
          pendingValue={pendingSiret ? formatSiret(pendingSiret) : undefined}
          emphasis="pending"
          className="border-t"
        >
          {formatSiret(maisonMereAAP.siret)}
        </InfoRow>
        <div>
          <SiretInformationCard
            siret={maisonMereAAP.siret}
            etablissement={etablissement}
          />
          {!!etablissement?.kbis?.mandatairesSociaux?.length && (
            <MandatairesSociauxCard
              mandatairesSociaux={etablissement.kbis.mandatairesSociaux}
            />
          )}
        </div>
        <AccountInfoRows
          maisonMereAAP={maisonMereAAP}
          pendingValues={legalInformationDocuments}
          emphasis="pending"
          badgeLabel="Modifié"
        />
        {isFeatureActive("MAISON_MERE_GENERAL_INFORMATION_UPDATE") && (
          <LegalInformationTile
            isAdmin
            // En attente de vérification, l'administrateur est déjà sur l'écran de vérification.
            href={
              isAwaitingVerification
                ? undefined
                : `/agencies-settings-v3/${maisonMereAAP.id}/general-information/legal-information`
            }
            statutValidationInformationsJuridiquesMaisonMereAAP={
              maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP
            }
            updateRequestedAt={
              lastUpdateRequest && toDate(lastUpdateRequest.decisionTakenAt)
            }
          />
        )}
        {legalInformationDocuments && (
          <>
            <LegalDocumentList
              collapsible
              attestationURSSAFFileUrl={
                legalInformationDocuments.attestationURSSAFFile?.previewUrl
              }
              justificatifIdentiteDirigeantFileUrl={
                legalInformationDocuments.justificatifIdentiteDirigeantFile
                  ?.previewUrl
              }
              lettreDeDelegationFileUrl={
                legalInformationDocuments.lettreDeDelegationFile?.previewUrl
              }
              justificatifIdentiteDelegataireFileUrl={
                legalInformationDocuments.justificatifIdentiteDelegataireFile
                  ?.previewUrl
              }
            />
            <hr />
            <ValidationDecisionForm
              maisonMereAAPId={maisonMereAAP.id}
              aapUpdatedDocumentsAt={legalInformationDocuments.createdAt}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MaisonMereAAPPage;
