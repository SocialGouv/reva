import { Etablissement } from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";

const CompanySummaryItem = ({
  title,
  description,
  descriptionClassName,
}: {
  title: string;
  description?: string;
  descriptionClassName?: string;
}) => {
  return description ? (
    <dl className="text-base text-neutral-900 pl-0 leading-tight">
      <dt className="font-semibold">{title}</dt>
      <dd className={`pl-0 ${descriptionClassName}`}>{description}</dd>
    </dl>
  ) : (
    <></>
  );
};

function toFullname(firstname?: string, lastname?: string): string | undefined {
  if (!firstname && !lastname) {
    return undefined;
  }
  return `${firstname || ""} ${lastname || ""}`.trim();
}

interface Props {
  siret: string;
  etablissment?: Etablissement | null;
}

export const CompanyPreview = (props: Props) => {
  const { siret, etablissment } = props;

  return (
    <div className="flex flex-col justify-between">
      <div className="hidden md:block bg-neutral-100 p-6 mb-5">
        <h2 className="mb-4">Informations liées au SIRET - {siret}</h2>

        {!etablissment && (
          <Alert
            description="Erreur : les données INSEE de l’organisation, nécessaires pour valider le rattachement, sont indisponibles ou inexistantes. Merci de réessayer ultérieurement."
            severity="error"
            title=""
            className="mb-5"
          />
        )}

        {etablissment &&
          (() => {
            const {
              siege_social,
              raison_sociale,
              forme_juridique,
              qualiopi_status,
              date_fermeture,
            } = etablissment;

            return (
              <>
                <div className="flex flex-row gap-2">
                  {siege_social ? (
                    <Badge severity="success">Siège social</Badge>
                  ) : (
                    <Badge severity="error">Établissement secondaire</Badge>
                  )}
                  {!date_fermeture ? (
                    <Badge severity="success">En activité</Badge>
                  ) : (
                    (() => {
                      const date = date_fermeture! as Date;
                      return (
                        <Badge severity="error">
                          Fermé le{" "}
                          {`${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`}
                        </Badge>
                      );
                    })()
                  )}
                  {qualiopi_status != undefined && (
                    <>
                      {qualiopi_status && (
                        <Badge severity="success">Qualiopi VAE Actif</Badge>
                      )}
                      {!qualiopi_status && (
                        <Badge severity="warning">Qualiopi VAE Inactif</Badge>
                      )}
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <CompanySummaryItem
                    title="Raison sociale"
                    description={raison_sociale}
                  />
                  <CompanySummaryItem
                    title="Nature juridique"
                    description={forme_juridique}
                  />
                </div>
              </>
            );
          })()}
      </div>
    </div>
  );
};
