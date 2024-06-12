import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useEtablissement } from "./CompanyPreview.hook";
import { format } from "date-fns";
import { GrayCard } from "../card/gray-card/GrayCard";

interface CompanyProps {
  companySiret: string;
  companyName: string;
  companyLegalStatus: string;
  companyWebsite?: string | null;
}

interface ManagerProps {
  managerFirstname?: string;
  managerLastname?: string;
}

interface AccountProps {
  accountEmail: string;
  accountPhoneNumber: string;
  accountFirstname: string;
  accountLastname: string;
}

interface Props {
  className?: string;
  company: CompanyProps;
  manager?: ManagerProps;
  account?: AccountProps;
}

export const CompanyPreview = (props: Props) => {
  const {
    className,
    company,

    manager,

    account,
  } = props;

  const { etablissement, isFetching, isLoading } = useEtablissement(
    company.companySiret,
  );

  return (
    <div className={`${className || ""}`}>
      <GrayCard className="col-span-2">
        <h2 className="col-span-3">
          Informations liées au SIRET {company.companySiret}
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
        <div className={`grid md:grid-cols-${manager ? 3 : 2}`}>
          <Info title="Raison sociale">{etablissement?.raisonSociale}</Info>
          <Info title="Nature juridique">{company.companyLegalStatus}</Info>

          {manager && (
            <Info title="Dirigeant">
              {!manager.managerFirstname && !manager.managerLastname
                ? "Non renseigné"
                : `${manager.managerFirstname} ${manager.managerLastname}`}
            </Info>
          )}
        </div>
      </GrayCard>

      {account && (
        <GrayCard className="mt-8 col-span-2">
          <h2>Administrateur du compte France VAE</h2>
          <div className="grid md:grid-cols-2">
            <Info title="Nom">
              {account.accountFirstname} {account.accountLastname}
            </Info>
            <Info title="Adresse email" className="break-words">
              {account.accountEmail}
            </Info>
            <Info title="Téléphone">{account.accountPhoneNumber}</Info>
            <Info title="Site internet de la structure" className="break-words">
              {company.companyWebsite || "Non spécifié"}
            </Info>
          </div>
        </GrayCard>
      )}
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
