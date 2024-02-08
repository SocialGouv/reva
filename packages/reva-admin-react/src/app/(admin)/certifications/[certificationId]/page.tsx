"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CertificationStatus } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      status
      expiresAt
      availableAt
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

  const { data: getCertificationResponse } = useQuery({
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
          <Info title="Disponible à partir du">
            {format(certification.availableAt, "dd/MM/yyyy")}
          </Info>
          <Info title="Expire le">
            {format(certification.expiresAt, "dd/MM/yyyy", { locale: fr })}
          </Info>
          <Info title="Niveau de la certification">
            {certification.degree.longLabel}
          </Info>
          <Info title="Type de la certification">
            {certification.typeDiplome.label}
          </Info>
          <br />
          <h2 className="text-2xl font-bold mb-2">
            Gestion de la certification
          </h2>
          <Info title="Administrateur de la certification">
            {certification.certificationAuthorityTag || "Inconnu"}
          </Info>
          {!!certification.domaines.length && (
            <Info title="Filières">
              <ul className="list-disc list-inside">
                {certification.domaines.map((d) => (
                  <li key={d.id}>{d.label}</li>
                ))}
              </ul>
            </Info>
          )}
          {!!certification.conventionsCollectives.length && (
            <Info title="Conventions collectives">
              <ul className="list-disc list-inside">
                {certification.conventionsCollectives.map((c) => (
                  <li key={c.id}>{c.label}</li>
                ))}
              </ul>
            </Info>
          )}
        </>
      )}
    </div>
  );
};

export default CertificationPage;

const Info = ({ title, children }: { title: string; children: ReactNode }) => (
  <dl className="m-2">
    <dt className="font-normal text-sm text-gray-600 mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);
