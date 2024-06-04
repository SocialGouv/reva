import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useEtablissement } from "./CompanyPreview.hook";
import { format } from "date-fns";
import { GrayCard } from "../card/gray-card/GrayCard";

interface Props {
  className?: string;
  companySiret: string;
  companyName: string;
  companyLegalStatus: string;
  companyWebsite?: string | null;
  managerFirstname?: string;
  managerLastname?: string;
  accountEmail: string;
  accountPhoneNumber: string;
  accountFirstname: string;
  accountLastname: string;
}

export const CompanyPreview = (props: Props) => {
  const {
    className,
    companySiret,
    companyName,
    companyLegalStatus,
    companyWebsite,
    managerFirstname,
    managerLastname,
    accountEmail,
    accountPhoneNumber,
    accountFirstname,
    accountLastname,
  } = props;

  const { etablissement, isFetching, isLoading } =
    useEtablissement(companySiret);

  return (
    <div className={`${className || ""}`}>
      <GrayCard className="col-span-2 mb-8">
        <h2 className="col-span-3">
          Informations liées au SIRET {companySiret}
        </h2>

        {!isLoading && !isFetching && !etablissement && (
          <Alert
            className="md:col-span-3 mb-2 -mt-2 mr-auto"
            severity="error"
            small
            title="Informations entreprise indisponibles"
            description=""
          />
        )}
        {etablissement && (
          <CompanyBadges
            className="col-span-3 mb-4"
            siegeSocial={etablissement.siegeSocial}
            dateFermeture={
              etablissement.dateFermeture
                ? new Date(etablissement.dateFermeture)
                : null
            }
            qualiopiStatus={!!etablissement.qualiopiStatus}
          />
        )}
        <div className="grid md:grid-cols-3">
          <Info title="Raison sociale">{companyName}</Info>
          <Info title="Nature juridique">{companyLegalStatus}</Info>
          <Info title="Dirigeant">
            {!managerFirstname && !managerLastname
              ? "Non renseigné"
              : `${managerFirstname} ${managerLastname}`}
          </Info>
        </div>
      </GrayCard>

      <GrayCard className="col-span-2">
        <h2>Administrateur du compte France VAE</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Nom">
            {accountFirstname} {accountLastname}
          </Info>
          <Info title="Adresse email" className="break-words">
            {accountEmail}
          </Info>
          <Info title="Téléphone">{accountPhoneNumber}</Info>
          <Info title="Site internet de la structure" className="break-words">
            {companyWebsite || "Non spécifié"}
          </Info>
        </div>
      </GrayCard>
    </div>
  );
};

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={`m-2 ${className || ""}`}>
    <dd className="font-bold">{title}</dd>
    <dt className="break-words">{children}</dt>
  </span>
);

const CompanyBadges = ({
  siegeSocial,
  dateFermeture,
  qualiopiStatus,
  className,
}: {
  siegeSocial: boolean;
  dateFermeture?: Date | null;
  qualiopiStatus: boolean;
  className?: string;
}) => (
  <div className={`flex flex-col md:flex-row gap-2 ${className || ""}`}>
    {siegeSocial ? (
      <Badge severity="success">Siège social</Badge>
    ) : (
      <Badge severity="error">Établissement secondaire</Badge>
    )}
    {!dateFermeture ? (
      <Badge severity="success">En activité</Badge>
    ) : (
      <Badge severity="error">
        Fermé le {format(dateFermeture, "dd/MM/yyyy")}
      </Badge>
    )}
    {qualiopiStatus && <Badge severity="success">Qualiopi VAE Actif</Badge>}
    {!qualiopiStatus && <Badge severity="warning">Qualiopi VAE Inactif</Badge>}
  </div>
);
