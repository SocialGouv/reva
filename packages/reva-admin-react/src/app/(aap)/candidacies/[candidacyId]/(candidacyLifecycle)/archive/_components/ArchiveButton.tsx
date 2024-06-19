import Button from "@codegouvfr/react-dsfr/Button";
import { useArchive } from "./useArchive";
import { useRouter } from "next/navigation";

export const ArchiveButton = () => {
  const router = useRouter();
  const { candidacyId, archiveCandidacyById } = useArchive({
    onSuccess: () => {
      router.push(`/candidacies/${candidacyId}/summary`);
    },
  });

  return (
    <Button
      disabled={archiveCandidacyById.isPending}
      onClick={() => archiveCandidacyById.mutate()}
      className="self-end"
    >
      Supprimer la candidature
    </Button>
  );
};
