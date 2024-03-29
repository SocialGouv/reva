"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  OrganismSummary,
  Info,
  Typology,
} from "@/components/organism-summary/OrganismSummary";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { selectedDepartmentsToTreeSelectItems } from "@/utils";
import MaisonMereAAPForm from "@/app/(admin)/maisonMereAAPs/[maisonMereAAPId]/MaisonMereAAPForm";
import { sortRegionsByAlphabeticalOrderAndDOM } from "@/utils";
import { BackButton } from "@/components/back-button/BackButton";
import { GrayCard } from "@/components/card/gray-card/GrayCard";

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
        <BackButton href="/subscriptions/validated">
          Toutes les inscriptions
        </BackButton>
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
        <MaisonMereAAPForm
          maisonMereAAPId={maisonMereAAP.id}
          onSiteDepartmentsOnRegions={regions.map(
            selectedDepartmentsToTreeSelectItems(selectedOnSiteDepartments),
          )}
          remoteDepartmentsOnRegions={regions.map(
            selectedDepartmentsToTreeSelectItems(selectedRemoteDepartments),
          )}
        />
      </div>
    )
  );
};

export default MaisonMereAAPPage;
