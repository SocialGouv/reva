"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  OrganismSummary,
  Typology,
} from "@/components/organism-summary/OrganismSummary";
import { OrganismSummary as OrganismSummaryNewLegal } from "@/components/organism-summary/OrganismSummaryNewLegal";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { selectedDepartmentsToTreeSelectItems } from "@/utils";
import MaisonMereAAPForm from "@/app/(admin)/maisonMereAAPs/[maisonMereAAPId]/MaisonMereAAPForm";
import { sortRegionsByAlphabeticalOrderAndDOM } from "@/utils";
import { BackButton } from "@/components/back-button/BackButton";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import LegalDocumentList from "@/app/(admin)/maisonMereAAPs/[maisonMereAAPId]/(components)/LegalDocumentsList";
import ValidationDecisionForm from "./(components)/ValidationDecisionForm";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { Info } from "@/components/organism-summary/Info";

const getMaisonMereAAP = graphql(`
  query getMaisonMereAAPById($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      phone
      siret
      raisonSociale
      dateExpirationCertificationQualiopi
      statutJuridique
      adresse
      ville
      codePostal
      typologie
      siteWeb
      createdAt
      statutValidationInformationsJuridiquesMaisonMereAAP
      legalInformationDocuments {
        managerFirstname
        managerLastname
        delegataire
        createdAt
        attestationURSSAFFile {
          name
          url
          mimeType
        }
        justificatifIdentiteDirigeantFile {
          name
          url
          mimeType
        }
        lettreDeDelegationFile {
          name
          url
          mimeType
        }
        justificatifIdentiteDelegataireFile {
          name
          url
          mimeType
        }
      }
      legalInformationDocumentsDecisions {
        id
        decision
        internalComment
        aapComment
        aapUpdatedDocumentsAt
        decisionTakenAt
      }
      maisonMereAAPOnDepartements {
        estSurPlace
        estADistance
        departement {
          id
          label
          code
        }
      }
      maisonMereAAPOnDomaines {
        domaine {
          label
        }
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

  const featureFlipping = useFeatureflipping();
  const showLegalValidation = featureFlipping.isFeatureActive(
    "LEGAL_INFORMATION_VALIDATION",
  );

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

  const selectedOnSiteDepartments = maisonMereAAP.maisonMereAAPOnDepartements
    .filter((d) => d.estSurPlace)
    .map((d) => d.departement);

  const selectedRemoteDepartments = maisonMereAAP.maisonMereAAPOnDepartements
    .filter((d) => d.estADistance)
    .map((d) => d.departement);

  return (
    maisonMereAAP && (
      <div className="flex flex-col flex-1 px-8 py-4">
        {!showLegalValidation && (
          <BackButton href="/subscriptions/validated">
            Toutes les inscriptions
          </BackButton>
        )}
        {showLegalValidation ? (
          <OrganismSummaryNewLegal
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
            companyAddress={maisonMereAAP.adresse}
            companyZipCode={maisonMereAAP.codePostal}
            companyCity={maisonMereAAP.ville}
            companyWebsite={maisonMereAAP.siteWeb}
            companyTypology={maisonMereAAP.typologie as Typology}
            domaines={maisonMereAAP.maisonMereAAPOnDomaines.map(
              (d) => d.domaine.label,
            )}
            ccns={maisonMereAAP.maisonMereAAPOnConventionCollectives.map(
              (c) => c.ccn.label,
            )}
            createdAt={new Date(maisonMereAAP.createdAt)}
            companyManagerFirstname={
              maisonMereAAP.legalInformationDocuments?.managerFirstname ??
              "Non renseigné"
            }
            companyManagerLastname={
              maisonMereAAP.legalInformationDocuments?.managerLastname ??
              "Non renseigné"
            }
            legalInformationDocumentsDecisions={maisonMereAAP.legalInformationDocumentsDecisions.map(
              (d) => ({
                ...d,
                aapUpdatedDocumentsAt: new Date(d.aapUpdatedDocumentsAt),
                decisionTakenAt: new Date(d.decisionTakenAt),
              }),
            )}
            statutValidationInformationsJuridiquesMaisonMereAAP={maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP}
          />
        ) : (
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
            companyAddress={maisonMereAAP.adresse}
            companyZipCode={maisonMereAAP.codePostal}
            companyCity={maisonMereAAP.ville}
            companyWebsite={maisonMereAAP.siteWeb}
            companyTypology={maisonMereAAP.typologie as Typology}
            domaines={maisonMereAAP.maisonMereAAPOnDomaines.map(
              (d) => d.domaine.label,
            )}
            ccns={maisonMereAAP.maisonMereAAPOnConventionCollectives.map(
              (c) => c.ccn.label,
            )}
          />
        )}

        {showLegalValidation ? (
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
        ) : (
          <GrayCard className="mt-8">
            <h3>Agences</h3>
            <ol>
              {maisonMereAAP.organisms.map((o) => (
                <li key={o.id} className="ml-4">
                  <h3 className="text-lg font-bold">
                    {o.informationsCommerciales?.nom || o.label}
                  </h3>
                  <Info title="Fermée pour absence ou congées:">
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
        )}
        <MaisonMereAAPForm
          maisonMereAAPId={maisonMereAAP.id}
          onSiteDepartmentsOnRegions={regions.map(
            selectedDepartmentsToTreeSelectItems(selectedOnSiteDepartments),
          )}
          remoteDepartmentsOnRegions={regions.map(
            selectedDepartmentsToTreeSelectItems(selectedRemoteDepartments),
          )}
          statutValidationInformationsJuridiquesMaisonMereAAP={
            maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP
          }
          showLegalValidation={showLegalValidation}
        />
        {showLegalValidation &&
          maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP ===
            "EN_ATTENTE_DE_VERIFICATION" &&
          maisonMereAAP.legalInformationDocuments && (
            <>
              <LegalDocumentList
                attestationURSSAFFile={
                  maisonMereAAP.legalInformationDocuments?.attestationURSSAFFile
                }
                justificatifIdentiteDirigeantFile={
                  maisonMereAAP.legalInformationDocuments
                    ?.justificatifIdentiteDirigeantFile
                }
                lettreDeDelegationFile={
                  maisonMereAAP.legalInformationDocuments
                    ?.lettreDeDelegationFile
                }
                justificatifIdentiteDelegataireFile={
                  maisonMereAAP.legalInformationDocuments
                    ?.justificatifIdentiteDelegataireFile
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
