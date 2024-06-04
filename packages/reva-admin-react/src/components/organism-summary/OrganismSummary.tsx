import { format } from "date-fns";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Info } from "./Info";
import { CompanyPreview } from "../company-preview";

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
  companyTypology: Typology;
  ccns?: string[];
  domaines?: string[];
}) => (
  <>
    <h1>{companyName}</h1>
    <div className="flex flex-col gap-8">
      <GrayCard>
        <h2>Informations générales</h2>
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
      </GrayCard>

      <CompanyPreview
        className="col-span-2"
        company={{
          companySiret,
          companyName,
          companyLegalStatus,
          companyWebsite,
        }}
      />

      <GrayCard>
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
