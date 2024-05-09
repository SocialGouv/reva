import { format } from "date-fns";
import { ReactNode } from "react";
import { GrayCard } from "@/components/card/gray-card/GrayCard";

export type Typology =
  | "generaliste"
  | "expertBranche"
  | "expertFiliere"
  | "expertBrancheEtFiliere";

const getTypologyLabel = (typology: Typology) => {
  switch (typology) {
    case "expertBranche":
      return "Expert branche";
    case "expertFiliere":
      return "Expert filière";
    case "generaliste":
      return "Généraliste";
    case "expertBrancheEtFiliere":
      return "Expert branche et filière";
  }
};

export const OrganismSummary = ({
  companyName,
  accountFirstname,
  accountLastname,
  accountEmail,
  accountPhoneNumber,
  companyWebsite,
  companyQualiopiCertificateExpiresAt,
  companySiret,
  companyLegalStatus,
  companyAddress,
  companyZipCode,
  companyCity,
  companyTypology,
  ccns,
  domaines,
  createdAt,
  companyManagerFirstname,
  companyManagerLastname,
}: {
  companyName: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
  companyWebsite?: string | null;
  companyQualiopiCertificateExpiresAt: Date;
  companySiret: string;
  companyLegalStatus: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  companyTypology: Typology;
  ccns?: string[];
  domaines?: string[];
  createdAt?: Date;
  companyManagerFirstname?: string;
  companyManagerLastname?: string;
}) => (
  <>
    <h1>{companyName}</h1>
      {createdAt && (
        <p>
          AAP inscrit depuis le {format(createdAt, "dd/MM/yyyy")}
        </p>
      )}
    <div className="grid grid-cols-2 gap-8">
      <GrayCard>
        <h2>Administrateur du compte France VAE</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Nom">
            {accountFirstname} {accountLastname}
          </Info>
          <Info title="Adresse email">
            {accountEmail}
          </Info>
          <Info title="Téléphone">
            {accountPhoneNumber}
          </Info>
          <Info title="Site internet de la structure">
            {companyWebsite || "Non spécifié"}
          </Info>
        </div>
      </GrayCard>
      <GrayCard>
        <h2>Informations juridiques de la structure</h2>
        <div className="grid md:grid-cols-2">
          <Info title="SIRET de la structure">{companySiret}</Info>
          <Info
            title="Forme juridique
"
          >
            {companyLegalStatus}
          </Info>
          <Info
            title="Adresse de la structure
"
          >
            {companyAddress} {companyZipCode} {companyCity}
          </Info>
        </div>
      </GrayCard>
      <GrayCard>
        <h2>Dirigeant</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Prénom">
            {companyManagerFirstname}
          </Info>
          <Info title="Nom">
            {companyManagerLastname}
          </Info>
        </div>
      </GrayCard>
      <GrayCard>
        <h2>Qualiopi</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Date d'expiration">{format(companyQualiopiCertificateExpiresAt, "dd/MM/yyyy")}</Info>
        </div>
      </GrayCard>
      <GrayCard className="col-span-2">
        <h2>Typologie</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Typologie">{getTypologyLabel(companyTypology)}</Info>
          {!!domaines?.length && (
            <Info title="Filière(s)">
              <ul className="ml-4">
                {domaines?.map((d) => (
                  <li className="list-disc" key={d}>
                    {d}
                  </li>
                ))}
              </ul>
            </Info>
          )}
          {!!ccns?.length && (
            <Info title="Conventions collectives">
              <ul className="ml-4">
                {ccns?.map((c) => (
                  <li className="list-disc" key={c}>
                    {c}
                  </li>
                ))}
              </ul>
            </Info>
          )}
        </div>
      </GrayCard>
    </div>
  </>
);

export const Info = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <dl className="m-2">
    <dt className="font-bold mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);
