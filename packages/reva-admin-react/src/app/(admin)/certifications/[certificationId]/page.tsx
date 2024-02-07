"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CertificationStatus } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      status
      typeDiplome {
        label
      }
      certificationAuthorityTag
      degree {
        longLabel
      }
      conventionsCollectives {
        id
        label
      }
      domaines {
        id
        label
      }
    }
  }
`);

const CertificationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { certificationId } = useParams<{ certificationId: string }>();

  const {
    data: getCertificationResponse,
    status: getCertificationQueryStatus,
  } = useQuery({
    queryKey: ["getCertification", certificationId],
    queryFn: () =>
      graphqlClient.request(getCertificationQuery, {
        certificationId,
      }),
  });

  const certification = getCertificationResponse?.getCertification;

  const certificationStatusToString = (s: CertificationStatus) => {
    switch (s) {
      case "AVAILABLE":
        return "Disponible";
      case "INACTIVE":
        return "Inactive";
      default:
        return "Inconnu";
    }
  };
  return (
    <div className="flex flex-col w-full">
      <Link
        href="/certifications"
        className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
      >
        Toutes les certifications
      </Link>
      {certification && (
        <>
          <h1 className="text-3xl font-bold mt-8">{certification.label}</h1>
          <p className="text-xl">{certification.codeRncp}</p>
          <p className="text-xl">
            Statut: {certificationStatusToString(certification.status)}
          </p>
          <h2 className="text-2xl font-bold mt-12 mb-2">
            Informations générales
          </h2>
          <p>Niveau de la certification: {certification.degree.longLabel}</p>
          <p>Type de certification: {certification.typeDiplome.label}</p>
          <br />
          <h2 className="text-2xl font-bold mb-2">
            Gestion de la certification
          </h2>
          <p>
            Administrateur de la certification:{" "}
            {certification.certificationAuthorityTag}
          </p>
          {!!certification.domaines.length && (
            <>
              <p>Filières:</p>
              <ul className="list-disc">
                {certification.domaines.map((d) => (
                  <li key={d.id} className="ml-4">
                    {d.label}
                  </li>
                ))}
              </ul>
            </>
          )}
          {!!certification.conventionsCollectives.length && (
            <>
              <p>Conventions collectives:</p>
              <ul className="list-disc">
                {certification.conventionsCollectives.map((c) => (
                  <li key={c.id} className="ml-4">
                    {c.label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CertificationPage;
