import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const feasibilityCompetenceBlocksModal = createModal({
  id: "feasibility-competence-blocks",
  isOpenedByDefault: false,
});

export const FeasibilityCompetenceBlocksModal = ({
  targetedBlocks,
  certificationBlocks,
}: {
  targetedBlocks: {
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
  const untargetedBlocks = certificationBlocks.filter(
    (block) =>
      !targetedBlocks.some((targetedBlock) => targetedBlock.id === block.id),
  );
  return (
    <feasibilityCompetenceBlocksModal.Component
      title="Recevabilité sur cette candidature"
      size="large"
    >
      {targetedBlocks.length > 0 && (
        <>
          <h5 className="text-base">Recevabilité obtenue sur les blocs : </h5>
          <ul>
            {targetedBlocks.map((block) => (
              <li key={block.id}>
                {block.code} - {block.label}
              </li>
            ))}
          </ul>
        </>
      )}
      {untargetedBlocks.length > 0 && (
        <>
          <h5 className="text-base mt-8">
            Blocs non concernés par la recevabilité :
          </h5>
          <ul>
            {untargetedBlocks.map((block) => (
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
