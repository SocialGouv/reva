import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { format, toDate } from "date-fns";

import { SmallNotice } from "@/components/small-notice/SmallNotice";

import { GrayCard } from "../card/gray-card/GrayCard";

import { useEtablissement } from "./CompanyPreview.hooks";

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

        {isLoading && (
          <>
            <div className="bg-neutral-200 rounded animate-pulse h-8 w-1/2"></div>
            <div className="bg-neutral-200 rounded animate-pulse h-24 w-full my-4"></div>
            <div className="bg-neutral-200 rounded animate-pulse h-6 w-1/3"></div>
          </>
        )}

        {etablissement && (
          <CompanyBadges
            className="col-span-3 mb-4"
            siegeSocial={etablissement.siegeSocial}
            dateFermeture={
              etablissement.dateFermeture
                ? toDate(etablissement.dateFermeture)
                : null
            }
            qualiopiStatus={!!etablissement.qualiopiStatus}
          />
        )}

        {!isLoading && (
          <div className={`grid md:grid-cols-${manager ? 3 : 2}`}>
            <Info title="Forme juridique">{company.companyLegalStatus}</Info>
            <Info title="Raison sociale">{etablissement?.raisonSociale}</Info>
            {manager && (
              <Info title="Dirigeant saisi à l'inscription">
                {!manager.managerFirstname && !manager.managerLastname
                  ? "Non renseigné"
                  : `${manager.managerFirstname} ${manager.managerLastname}`}
              </Info>
            )}
            {etablissement && !etablissement?.kbis && (
              <SmallNotice className="mt-4">
                Cet établissement ne dispose pas de Kbis.
              </SmallNotice>
            )}
          </div>
        )}

        {etablissement?.kbis?.formeJuridique && (
          <div className={`grid md:grid-cols-2`}>
            <Info title="Forme juridique précisée sur le Kbis">
              {etablissement.kbis?.formeJuridique}
            </Info>
          </div>
        )}

        {etablissement?.kbis?.mandatairesSociaux && (
          <div className="border-t border-neutral-300 mt-6 pt-8">
            <h3>
              {etablissement?.kbis?.mandatairesSociaux.length == 1
                ? "Mandataire social unique"
                : "Mandataires sociaux"}
            </h3>
            <ul>
              {etablissement.kbis.mandatairesSociaux.map((mandataire) => (
                <li key={`${mandataire.nom}`}>
                  <div className="grid md:grid-cols-2">
                    <Info title="Nom">
                      {mandataire.type == "PERSONNE_PHYSIQUE" ? (
                        <>
                          <span className="fr-icon--sm fr-icon-user-fill mr-2"></span>
                          <span className="sr-only">Personne physique</span>
                        </>
                      ) : (
                        <>
                          <span className="fr-icon--sm fr-icon-building-fill mr-2"></span>
                          <span className="sr-only">Personne morale</span>
                        </>
                      )}
                      {mandataire.nom}
                    </Info>
                    {mandataire.fonction && (
                      <Info title="Fonction">{mandataire.fonction}</Info>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </GrayCard>

      {account && (
        <GrayCard className="mt-8 col-span-2">
          <h2>Administrateur du compte France VAE</h2>
          <div className="grid md:grid-cols-2">
            <Info title="Nom">
              {account.accountFirstname} {account.accountLastname}
            </Info>
            <Info title="Adresse électronique" className="break-words">
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

export const CompanyBadges = ({
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
      <Badge severity="success" data-test="siege-social-badge">
        Siège social
      </Badge>
    ) : (
      <Badge severity="error" data-test="etablissement-secondaire-badge">
        Établissement secondaire
      </Badge>
    )}
    {!dateFermeture ? (
      <Badge severity="success" data-test="en-activite-badge">
        En activité
      </Badge>
    ) : (
      <Badge severity="error" data-test="ferme-badge">
        Fermé le {format(dateFermeture, "dd/MM/yyyy")}
      </Badge>
    )}
    {qualiopiStatus && (
      <Badge severity="success" data-test="qualiopi-actif-badge">
        Qualiopi VAE Actif
      </Badge>
    )}
    {!qualiopiStatus && (
      <Badge severity="warning" data-test="qualiopi-inactif-badge">
        Qualiopi VAE Inactif
      </Badge>
    )}
  </div>
);
