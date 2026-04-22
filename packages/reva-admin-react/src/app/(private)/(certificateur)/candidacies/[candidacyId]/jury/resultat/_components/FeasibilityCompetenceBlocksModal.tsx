import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const feasibilityCompetenceBlocksModal = createModal({
  id: "feasibility-competence-blocks-modal",
  isOpenedByDefault: false,
});

export const FeasibilityCompetenceBlocksModal = ({
  receivableBlocks,
  certificationBlocks,
}: {
  receivableBlocks: {
    id: string;
    code?: string | null;
    label: string;
  }[];
  certificationBlocks: {
    id: string;
    code?: string | null;
    label: string;
  }[];
}) => {
  const nonReceivableBlocks = certificationBlocks.filter(
    (block) =>
      !receivableBlocks.some(
        (receivableBlock) => receivableBlock.id === block.id,
      ),
  );
  return (
    <feasibilityCompetenceBlocksModal.Component
      title="Recevabilité sur cette candidature"
      size="large"
    >
      {receivableBlocks.length > 0 && (
        <>
          <h5 className="text-base">Recevabilité obtenue sur les blocs : </h5>
          <ul>
            {receivableBlocks.map((block) => (
              <li key={block.id}>
                {block.code} - {block.label}
              </li>
            ))}
          </ul>
        </>
      )}
      {nonReceivableBlocks.length > 0 && (
        <>
          <h5 className="text-base mt-8">
            Blocs non concernés par la recevabilité :
          </h5>
          <ul>
            {nonReceivableBlocks.map((block) => (
              <li key={block.id}>
                {block.code} - {block.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </feasibilityCompetenceBlocksModal.Component>
  );
};
