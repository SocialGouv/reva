"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { Typology } from "@/components/organism-summary/OrganismSummary";
import { OrganismSummary } from "@/components/organism-summary/OrganismSummary";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { sortRegionsByAlphabeticalOrderAndDOM } from "@/utils";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import ValidationDecisionForm from "./(components)/ValidationDecisionForm";
import { Info } from "@/components/organism-summary/Info";
import { LegalDocumentList } from "@/components/legal-document-list/LegalDocumentList";

const getMaisonMereAAP = graphql(`
  query getMaisonMereAAPById($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      phone
      siret
      raisonSociale
      dateExpirationCertificationQualiopi
      statutJuridique
      typologie
      siteWeb
      createdAt
      statutValidationInformationsJuridiquesMaisonMereAAP
      managerFirstname
      managerLastname
      legalInformationDocuments {
        managerFirstname
        managerLastname
        delegataire
        createdAt
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
      legalInformationDocumentsDecisions {
        id
        decision
        internalComment
        aapComment
        aapUpdatedDocumentsAt
        decision
        decisionTakenAt
      }
      maisonMereAAPOnConventionCollectives {
        ccn {
          label
        }
      }
      gestionnaire {
        firstname
        lastname
        email
      }
      organisms {
        id
        label
        informationsCommerciales {
          nom
        }
        isActive
        fermePourAbsenceOuConges
        managedDegrees {
          id
          degree {
            id
            longLabel
          }
        }
      }
    }
  }
`);

const getRegions = graphql(`
  query getRegions {
    getRegions {
      id
      label
      code
      departments {
        id
        label
        code
      }
    }
  }
`);

const MaisonMereAAPPage = () => {
  const { maisonMereAAPId }: { maisonMereAAPId: string } = useParams();

  const { graphqlClient } = useGraphQlClient();

  const { data: getMaisonMereAAPResponse, isLoading: isMaisonMereAAPLoading } =
    useQuery({
      queryKey: ["getMaisonMereAAP", maisonMereAAPId],
      queryFn: () =>
        graphqlClient.request(getMaisonMereAAP, {
          maisonMereAAPId,
        }),
    });

  const { data: getRegionsResponse, isLoading: isRegionsLoading } = useQuery({
    queryKey: ["getRegionsResponse"],
    queryFn: () => graphqlClient.request(getRegions),
  });

  const maisonMereAAP = getMaisonMereAAPResponse?.organism_getMaisonMereAAPById;
  const unsortedRegions = getRegionsResponse?.getRegions || [];
  const regions = sortRegionsByAlphabeticalOrderAndDOM(unsortedRegions);

  if (isMaisonMereAAPLoading || isRegionsLoading || !maisonMereAAP) {
    return <></>;
  }

  return (
    maisonMereAAP && (
      <div className="flex flex-col flex-1 px-8 py-4">
        <OrganismSummary
          companyName={maisonMereAAP.raisonSociale}
          accountFirstname={maisonMereAAP.gestionnaire.firstname || ""}
          accountLastname={maisonMereAAP.gestionnaire.lastname || ""}
          accountEmail={maisonMereAAP.gestionnaire.email}
          accountPhoneNumber={maisonMereAAP.phone || ""}
          companyQualiopiCertificateExpiresAt={
            new Date(maisonMereAAP.dateExpirationCertificationQualiopi || "")
          }
          companySiret={maisonMereAAP.siret}
          companyLegalStatus={maisonMereAAP.statutJuridique}
          companyWebsite={maisonMereAAP.siteWeb}
          companyTypology={maisonMereAAP.typologie as Typology}
          ccns={maisonMereAAP.maisonMereAAPOnConventionCollectives.map(
            (c) => c.ccn.label,
          )}
          createdAt={new Date(maisonMereAAP.createdAt)}
          companyManagerFirstname={
            maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP ==
            "A_JOUR"
              ? maisonMereAAP.managerFirstname || undefined
              : maisonMereAAP.legalInformationDocuments?.managerFirstname
          }
          companyManagerLastname={
            maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP ==
            "A_JOUR"
              ? maisonMereAAP.managerLastname || undefined
              : maisonMereAAP.legalInformationDocuments?.managerLastname
          }
          legalInformationDocumentsDecisions={maisonMereAAP.legalInformationDocumentsDecisions.map(
            (d) => ({
              ...d,
              aapUpdatedDocumentsAt: new Date(d.aapUpdatedDocumentsAt),
              decisionTakenAt: new Date(d.decisionTakenAt),
            }),
          )}
          statutValidationInformationsJuridiquesMaisonMereAAP={
            maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP
          }
        />
        <GrayCard className="mt-8">
          <h3>Agences</h3>
          <ol className="grid grid-cols-1 md:grid-cols-2">
            {maisonMereAAP.organisms.map((o) => (
              <li key={o.id} className="ml-4">
                <h3 className="text-lg font-bold">
                  {o.informationsCommerciales?.nom || o.label}
                </h3>
                <Info title="Fermée pour absence ou congés:">
                  <div> {o.fermePourAbsenceOuConges ? "Oui" : "Non"}</div>
                </Info>
                <Info title="Niveaux de diplômes couverts:">
                  <ul>
                    {o.managedDegrees.map((d) => (
                      <li key={d.id}>{d.degree.longLabel}</li>
                    ))}
                  </ul>
                </Info>
              </li>
            ))}
          </ol>
        </GrayCard>
        {maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP ===
          "EN_ATTENTE_DE_VERIFICATION" &&
          maisonMereAAP.legalInformationDocuments && (
            <>
              <LegalDocumentList
                attestationURSSAFFileUrl={
                  maisonMereAAP.legalInformationDocuments?.attestationURSSAFFile
                    ?.previewUrl
                }
                justificatifIdentiteDirigeantFileUrl={
                  maisonMereAAP.legalInformationDocuments
                    ?.justificatifIdentiteDirigeantFile?.previewUrl
                }
                lettreDeDelegationFileUrl={
                  maisonMereAAP.legalInformationDocuments
                    ?.lettreDeDelegationFile?.previewUrl
                }
                justificatifIdentiteDelegataireFileUrl={
                  maisonMereAAP.legalInformationDocuments
                    ?.justificatifIdentiteDelegataireFile?.previewUrl
                }
              />
              <hr />
              <ValidationDecisionForm
                maisonMereAAPId={maisonMereAAP.id}
                aapUpdatedDocumentsAt={
                  maisonMereAAP.legalInformationDocuments.createdAt
                }
              />
            </>
          )}
      </div>
    )
  );
};

export default MaisonMereAAPPage;
