"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  OrganismSummary,
  Info,
  Typology,
} from "@/components/organism-summary/OrganismSummary";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

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
          code
          label
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

  const maisonMereAAP = getMaisonMereAAPResponse?.organism_getMaisonMereAAPById;

  return (
    maisonMereAAP && (
      <div className="flex flex-col flex-1">
        <Link
          href="/subscriptions/pending"
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
            new Date(maisonMereAAP.dateExpirationCertificationQualiopi || "")
          }
          companySiret={maisonMereAAP.siret}
          companyLegalStatus={maisonMereAAP.statutJuridique}
          companyAddress={maisonMereAAP.adresse}
          companyZipCode={maisonMereAAP.codePostal}
          companyCity={maisonMereAAP.ville}
          companyWebsite={maisonMereAAP.siteWeb}
          companyTypology={maisonMereAAP.typologie as Typology}
          onSiteDepartments={maisonMereAAP.maisonMereAAPOnDepartements
            .filter((d) => d.estSurPlace)
            .map((d) => ({
              label: d.departement.label,
              code: d.departement.code,
            }))}
          remoteDemartments={maisonMereAAP.maisonMereAAPOnDepartements
            .filter((d) => d.estADistance)
            .map((d) => ({
              label: d.departement.label,
              code: d.departement.code,
            }))}
          domaines={maisonMereAAP.maisonMereAAPOnDomaines.map(
            (d) => d.domaine.label,
          )}
          ccns={maisonMereAAP.maisonMereAAPOnConventionCollectives.map(
            (c) => c.ccn.label,
          )}
        />
        <div>
          <h2 className="text-xl font-bold my-4">Agences</h2>
          <ul>
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
                      <li key={d.id} className="list-disc list-inside">
                        {d.degree.longLabel}
                      </li>
                    ))}
                  </ul>
                </Info>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
};

export default MaisonMereAAPPage;
