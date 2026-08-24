import { GrayCard } from "@/components/card/gray-card/GrayCard";

import { GetEtablissementQuery } from "@/graphql/generated/graphql";

type MandataireSocial = NonNullable<
  NonNullable<GetEtablissementQuery["getEtablissementAsAdmin"]>["kbis"]
>["mandatairesSociaux"][number];

// Bloc repris de CompanyPreview: l'écran d'inscription continue de rendre le sien.
export const MandatairesSociauxCard = ({
  mandatairesSociaux,
}: {
  mandatairesSociaux: MandataireSocial[];
}) => (
  <GrayCard as="div" className="pt-0">
    <h3 className="border-t border-neutral-300 pt-6">
      {mandatairesSociaux.length === 1
        ? "Mandataire social unique"
        : "Mandataires sociaux"}
    </h3>
    <ul className="list-none p-0 m-0">
      {mandatairesSociaux.map((mandataire, index) => (
        <li
          key={`${mandataire.nom}-${index}`}
          className="flex items-center gap-6 border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey"
        >
          <div className="flex items-center gap-2">
            <span
              className={
                mandataire.type === "PERSONNE_PHYSIQUE"
                  ? "fr-icon--sm fr-icon-user-fill"
                  : "fr-icon--sm fr-icon-building-fill"
              }
              aria-hidden="true"
            />
            <span className="sr-only">
              {mandataire.type === "PERSONNE_PHYSIQUE"
                ? "Personne physique"
                : "Personne morale"}
            </span>
            <span className="font-bold">{mandataire.nom}</span>
          </div>
          <div className="flex-1 text-right">{mandataire.fonction}</div>
        </li>
      ))}
    </ul>
  </GrayCard>
);
