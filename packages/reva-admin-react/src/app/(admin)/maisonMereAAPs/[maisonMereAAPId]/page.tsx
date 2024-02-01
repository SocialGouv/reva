"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  OrganismSummary,
  Typology,
} from "@/components/organism-summary/OrganismSummary";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toSelectedRegionAndDepartmentsItem } from "@/utils";

const getMaisonMereAAP = graphql(`
  query getMaisonMereAAPById($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
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
    }
  }
`);

const getRegions = graphql(`
  query getRegions {
    getRegions {
      id
      label
      departments {
        id
        label
        code
      }
    }
  }
`);

const adminUpdateMaisonMereAAP = graphql(`
  mutation adminUpdateMaisonMereAAP(
    $maisonMereAAPId: ID!
    $data: UpdateMaisonMereAAPInput!
  ) {
    organism_adminUpdateMaisonMereAAP(
      maisonMereAAPId: $maisonMereAAPId
      maisonMereAAPData: $data
    ) {
      id
    }
  }
`);

const MaisonMereAAPPage = () => {
  const { maisonMereAAPId }: { maisonMereAAPId: string } = useParams();

  const { graphqlClient } = useGraphQlClient();

  const { data: getMaisonMereAAPResponse } = useQuery({
    queryKey: ["getMaisonMereAAP", maisonMereAAPId],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAP, {
        maisonMereAAPId,
      }),
  });

  const { data: getRegionsResponse } = useQuery({
    queryKey: ["getRegionsResponse"],
    queryFn: () => graphqlClient.request(getRegions),
  });

  const maisonMereAAP = getMaisonMereAAPResponse?.organism_getMaisonMereAAPById;
  const regions = getRegionsResponse?.getRegions || [];

  if (!maisonMereAAP) {
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
        <Link
          href="/subscriptions/validated"
          className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
        >
          Toutes les inscriptions
        </Link>
        <OrganismSummary
          companyName={maisonMereAAP.raisonSociale}
          accountFirstname={maisonMereAAP.gestionnaire.firstname || ""}
          accountLastname={maisonMereAAP.gestionnaire.lastname || ""}
          accountEmail={maisonMereAAP.gestionnaire.email}
          accountPhoneNumber=""
          companyQualiopiCertificateExpiresAt={
            maisonMereAAP.dateExpirationCertificationQualiopi
          }
          companySiret={maisonMereAAP.siret}
          companyLegalStatus={maisonMereAAP.statutJuridique}
          companyAddress={maisonMereAAP.adresse}
          companyZipCode={maisonMereAAP.codePostal}
          companyCity={maisonMereAAP.ville}
          companyWebsite={maisonMereAAP.siteWeb}
          companyTypology={maisonMereAAP.typologie as Typology}
          onSiteDepartmentsOnRegions={regions.map(
            toSelectedRegionAndDepartmentsItem(selectedOnSiteDepartments),
          )}
          remoteDepartmentsOnRegions={regions.map(
            toSelectedRegionAndDepartmentsItem(selectedRemoteDepartments),
          )}
          domaines={maisonMereAAP.maisonMereAAPOnDomaines.map(
            (d) => d.domaine.label,
          )}
          ccns={maisonMereAAP.maisonMereAAPOnConventionCollectives.map(
            (c) => c.ccn.label,
          )}
          readonly
        />
      </div>
    )
  );
};

export default MaisonMereAAPPage;
