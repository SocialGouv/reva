import Tag from "@codegouvfr/react-dsfr/Tag";
import Link from "next/link";

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
    <h2 className="text-xl  mb-0">Estimation des frais de certification</h2>
    {juryEstimatedCost && (
      <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
        <div className="w-[400px]">Montant à régler au certificateur</div>
        <Tag>
          <span className="fr-icon-money-euro-circle-fill fr-icon--sm mr-1" />
          {juryEstimatedCost}
        </Tag>
      </div>
    )}

    <div>
      <h3 className="text-base my-0">
        Pour comprendre le rôle du certificateur :
      </h3>
      <Link
        href="https://vae.gouv.fr/savoir-plus/articles/missions-organisme-certificateur/"
        className="fr-link"
        target="_blank"
      >
        Quelles sont les missions d’un organisme certificateur ?
      </Link>
    </div>

    {juryPlace ? (
      <div>
        <h2 className="text-xl mb-4">Lieu de passage du jury</h2>
        <p className="my-0">{juryPlace}</p>
      </div>
    ) : (
      <div className="flex gap-2">
        <span className="fr-icon-info-fill text-dsfrGray-mentionGrey" />
        <p className="text-dsfrGray-titleGrey italic mb-0">
          Il n’y a pas de lieu de passage renseigné pour le jury sur ce diplôme.
        </p>
      </div>
    )}
    <div>
      <Link
        href="https://vae.gouv.fr/savoir-plus/articles/comment-se-deroule-un-jury-vae/"
        className="fr-link"
        target="_blank"
      >
        Comment se déroule un jury VAE ?
      </Link>
    </div>
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
