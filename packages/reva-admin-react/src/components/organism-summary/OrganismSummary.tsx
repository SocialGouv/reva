import { format } from "date-fns";
import { ReactNode } from "react";
import { TreeSelect, TreeSelectItem } from "@/components/tree-select";
import { isInterventionZoneIsFullySelectedWithoutDOM } from "@/utils";

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
    <h2 className="text-xl font-bold my-4">Typologie</h2>
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
  </div>
);

export const Info = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <dl className="m-2">
    <dt className="font-normal text-sm text-gray-600 mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);
