import Tag from "@codegouvfr/react-dsfr/Tag";

import { CertificationJuryTypeOfModality } from "@/graphql/generated/graphql";

export const JuryTab = ({
  juryTypeMiseEnSituationProfessionnelle,
  juryTypeSoutenanceOrale,
  juryEstimatedCost,
  juryPlace,
}: {
  juryTypeMiseEnSituationProfessionnelle?: CertificationJuryTypeOfModality | null;
  juryTypeSoutenanceOrale?: CertificationJuryTypeOfModality | null;
  juryEstimatedCost?: number | null;
  juryPlace?: string | null;
}) => (
  <div className="flex flex-col gap-6">
    <h2 className="text-xl mb-0">Types d’épreuves </h2>
    <ModalityLine
      label="Soutenance orale du dossier de validation"
      typeOfModality={juryTypeSoutenanceOrale}
    />
    <ModalityLine
      label="Mise en situation professionnelle"
      typeOfModality={juryTypeMiseEnSituationProfessionnelle}
    />
    <h2 className="text-xl  mb-0">Frais de certification</h2>
    {
      <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
        <div className="w-[400px]">À prévoir pour passer l’épreuve</div>
        {juryEstimatedCost ? (
          <Tag>
            <span className="fr-icon-money-euro-circle-fill fr-icon--sm mr-1" />
            {juryEstimatedCost}
          </Tag>
        ) : (
          <span>
            Les frais de jury n'ont pas été renseignés par le certificateur,
            rapprochez vous de celui-ci pour plus d'informations.
          </span>
        )}
      </div>
    }

    {juryPlace ? (
      <>
        <h2 className="text-xl">Lieu de passage</h2>
        <p>{juryPlace}</p>
      </>
    ) : (
      <div className="flex gap-2">
        <span className="fr-icon-info-fill text-dsfrGray-mentionGrey" />
        <p className="text-dsfrGray-titleGrey italic">
          Il n’y a pas de lieu de passage renseigné pour le jury sur ce diplôme.
        </p>
      </div>
    )}
  </div>
);

const ModalityLine = ({
  label,
  typeOfModality,
}: {
  label: string;
  typeOfModality?: CertificationJuryTypeOfModality | null;
}) =>
  typeOfModality ? (
    <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
      <div className="md:w-[400px]">{label}</div>
      <div className="flex gap-2">
        {(typeOfModality === "PRESENTIEL" || typeOfModality === "LES_DEUX") && (
          <Tag>Présentiel</Tag>
        )}
        {(typeOfModality === "A_DISTANCE" || typeOfModality === "LES_DEUX") && (
          <Tag>À distance</Tag>
        )}
      </div>
    </div>
  ) : null;
