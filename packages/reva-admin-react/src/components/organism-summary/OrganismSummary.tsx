import { format } from "date-fns";
import { ReactNode } from "react";

type Typology =
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
  onSiteDepartments,
  remoteDemartments,
}: {
  companyName: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
  companyWebsite?: string;
  companyQualiopiCertificateExpiresAt: Date;
  companySiret: string;
  companyLegalStatus: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  companyTypology: Typology;
  onSiteDepartments: { label: string; code: string }[];
  remoteDemartments: { label: string; code: string }[];
}) => (
  <div className="flex flex-col mt-10">
    <h1 className="text-4xl font-bold">{companyName}</h1>
    <h2 className="text-xl font-bold my-4">Informations générales</h2>
    <div className="grid md:grid-cols-2">
      <Info title="Nom de l'architecte de parcours">
        {accountFirstname} {accountLastname}
      </Info>
      <Info title="Adresse email de l'architecte de parcours">
        {accountEmail}
      </Info>
      <Info title="Téléphone de l'architecte de parcours">
        {accountPhoneNumber}
      </Info>
      <Info title="Site internet de la structure">
        {companyWebsite || "Non spécifié"}
      </Info>
      <Info title="Date d'expiration de la certification Qualiopi VAE">
        {format(companyQualiopiCertificateExpiresAt, "dd/MM/yyyy")}
      </Info>
    </div>
    <br />
    <h2 className="text-xl font-bold my-4">
      Informations juridiques de la structure
    </h2>
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
    <br />
    <h2 className="text-xl font-bold my-4">Typologie et zone d'intervention</h2>
    <Info title="Typologie">{getTypologyLabel(companyTypology)}</Info>
    <div className="grid md:grid-cols-2">
      <Info title="Zone d'intervention en présentiel">
        <ul className="ml-4">
          {onSiteDepartments.map((d) => (
            <li key={d.code} className="list-disc">
              {d.label} ({d.code})
            </li>
          ))}
        </ul>
      </Info>
      <Info title="Zone d'intervention en distanciel">
        <ul className="ml-4">
          {remoteDemartments.map((d) => (
            <li key={d.code} className="list-disc">
              {d.label} ({d.code})
            </li>
          ))}
        </ul>
      </Info>
    </div>
  </div>
);

const Info = ({ title, children }: { title: string; children: ReactNode }) => (
  <dl className="m-2">
    <dt className="font-normal text-sm text-gray-600 mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);