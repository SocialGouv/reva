import { TypeAccompagnement } from "@/graphql/generated/graphql";
import Tag from "@codegouvfr/react-dsfr/Tag";

interface Props {
  typeAccompagnement?: TypeAccompagnement;
  certificationLabel: string;
}

export const CandidateRegistrationSidebar = ({
  typeAccompagnement,
  certificationLabel,
}: Props) => {
  return (
    <div className="py-4 border-r pr-4">
      <h2 className="mb-3">Résumé</h2>
      <h6 className="border p-4 mb-4">{certificationLabel}</h6>
      {typeAccompagnement && (
        <div>
          <Tag small>
            {typeAccompagnement === "ACCOMPAGNE"
              ? "VAE accompagnée"
              : "En autonomie"}
          </Tag>
        </div>
      )}
    </div>
  );
};
