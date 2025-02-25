import { TypeAccompagnement } from "@/graphql/generated/graphql";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Image from "next/image";

interface Props {
  typeAccompagnement?: TypeAccompagnement;
  certification: {
    label: string;
    codeRncp: string;
  };
}

export const CandidateRegistrationSidebar = ({
  typeAccompagnement,
  certification,
}: Props) => {
  return (
    <div className="py-4 border-r pr-4 w-[282px]">
      <h2 className="mb-3">Résumé</h2>
      <div className="border p-6 mb-4">
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Image
            width={16}
            height={16}
            src="/candidate-space/verified-badge.svg"
            alt="Success pictogram"
            aria-hidden="true"
            className="mr-2 inline-block"
          />
          RNCP{" "}
          <span data-testid="selected-certification-code-rncp">
            {certification.codeRncp}
          </span>
        </div>
        <h6 data-testid="selected-certification-label" className="mb-0">
          {certification.label}
        </h6>
      </div>
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
