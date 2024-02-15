"use client";
import { useCertificationQueries } from "@/app/(admin)/certifications/[certificationId]/certificationQueries";
import { CertificationStatus } from "@/graphql/generated/graphql";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

const CertificationPage = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const { certification } = useCertificationQueries({ certificationId });

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
          <h1 className="text-2xl font-bold mt-8">{certification.label}</h1>
          <p>{certification.codeRncp}</p>
          <p>Statut: {certificationStatusToString(certification.status)}</p>
          <h2 className="text-xl font-bold mt-12 mb-2">
            Informations générales
          </h2>
          <div className="grid grid-cols-2">
            <Info title="Niveau de la certification">
              {certification.degree.longLabel}
            </Info>
            <Info title="Type de la certification">
              {certification.typeDiplome.label}
            </Info>
            <Info title="Disponible à partir du">
              {format(certification.availableAt, "dd/MM/yyyy")}
            </Info>
            <Info title="Expire le">
              {format(certification.expiresAt, "dd/MM/yyyy", { locale: fr })}
            </Info>
          </div>
          <br />
          <h2 className="text-xl font-bold mb-2">
            Gestion de la certification
          </h2>
          <div className="grid grid-cols-2">
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
              <Info title="Branches">
                <ul className="list-disc list-inside">
                  {certification.conventionsCollectives.map((c) => (
                    <li key={c.id}>{c.label}</li>
                  ))}
                </ul>
              </Info>
            )}
            <Info
              title="Administrateur de la certification"
              className="col-span-2"
            >
              {certification.certificationAuthorityTag || "Inconnu"}
            </Info>
            <Info
              title="Admins Certificateur et comptes locaux"
              className="col-span-2"
            >
              <ul className="list-disc list-inside mt-2">
                {certification.certificationAuthorities.map((c) => (
                  <li key={c.id}>
                    {c.label}
                    <ul className="ml-6 pt-1 list-square list-inside">
                      {c.certificationAuthorityLocalAccounts.map((l) => (
                        <li
                          key={l.id}
                        >{`${l.account.email} - ${l.account.firstname} - ${l.account.lastname}`}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Info>
          </div>
        </>
      )}
      <div className="flex flex-col md:flex-row gap-4 mt-8 ml-auto">
        <Button
          linkProps={{ href: `/certifications/${certificationId}/update` }}
        >
          Modifier
        </Button>
        <Button
          linkProps={{ href: `/certifications/${certificationId}/replace` }}
        >
          Remplacer
        </Button>
      </div>
    </div>
  );
};

export default CertificationPage;

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`m-2 ${className}`}>
    <dt className="font-normal text-sm text-gray-600 mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);
