import { TypeAccompagnement } from "@/graphql/generated/graphql";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Image from "next/image";

interface Props {
  isAapAvailable: boolean;
  typeAccompagnement?: TypeAccompagnement;
  certification: {
    label: string;
    codeRncp: string;
  };
}

export const CandidateRegistrationSidebar = ({
  isAapAvailable,
  typeAccompagnement,
  certification,
}: Props) => {
  return (
    <div className="mb-8 lg:mb-0 lg:py-4 lg:border-r lg:px-4 lg:w-[284px]">
      <h2 className="mb-3">Résumé</h2>
      <div className="border p-6 mb-4">
        {!typeAccompagnement &&
          (isAapAvailable ? (
            <Tag small className="lg:!w-full mb-3">
              <span
                data-testid="tag-modalite-inconnue-accompagne-disponible"
                className="truncate"
              >
                VAE en autonomie ou accompagnée
              </span>
            </Tag>
          ) : (
            <Tag small className="mb-3">
              <span data-testid="tag-modalite-inconnue-accompagne-indisponible">
                VAE en autonomie
              </span>
            </Tag>
          ))}
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
          {typeAccompagnement === "ACCOMPAGNE" ? (
            <Tag data-testid="tag-accompagne" small>
              VAE accompagnée
            </Tag>
          ) : (
            <Tag data-testid="tag-autonome" small>
              En autonomie
            </Tag>
          )}
        </div>
      )}
    </div>
  );
};
