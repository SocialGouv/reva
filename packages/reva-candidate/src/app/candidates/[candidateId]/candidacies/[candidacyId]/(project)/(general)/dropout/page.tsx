"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

import { BackButton } from "@/components/back-button/BackButton";
import { Panel } from "@/components/layout/Panel";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { graphqlErrorToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

import { useDropout } from "./dropout.hook";

const schema = z.object({
  dropOutReasonId: sanitizedText(),
});

export default function DropoutCandidacyPage() {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const router = useRouter();

  const {
    candidacy,
    dropoutCandidacyById,
    isDropoutLoading,
    activeDropoutReasons,
  } = useDropout();

  if (isDropoutLoading) {
    return <LoaderWithLayout />;
  }

  if (!candidacy) {
    return null;
  }

  const candidateCertification =
    candidacy.certification &&
    `RNCP ${candidacy.certification?.codeRncp} : ${candidacy.certification?.label}`;

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!candidacy?.id) {
      return;
    }

    try {
      await dropoutCandidacyById({
        candidacyId: candidacy.id,
        dropoutReasonId: data.dropOutReasonId,
      });
      toast.success("Candidature abandonnée avec succès");
      router.push(`../`);
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  const certificationLabel = `RNCP ${candidacy.certification?.codeRncp} : ${candidacy.certification?.label}`;

  return (
    <Panel>
      <Breadcrumb
        currentPageLabel="Abandon de la candidature"
        className="mb-0"
        segments={[
          {
            label: "Mes candidatures",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: certificationLabel,
            linkProps: {
              href: "../",
            },
          },
        ]}
      />

      <div className="pr-[30%]">
        <h1 className="mt-6 mb-2">Abandon de la candidature</h1>
        <FormOptionalFieldsDisclaimer className="mb-12" />
        <p className="mb-6">
          Vous êtes sur le point d'abandonner votre candidature sur la
          certification <strong>{candidateCertification}</strong>.
          <br />
          <br />
          Votre dossier de faisabilité n'a pas encore été envoyé au
          certificateur.
        </p>
        <p className="mb-6 text-lg font-bold">
          Quelles sont les conséquences d’un abandon à cette étape ?
        </p>
        <Highlight>
          <ul>
            <li>
              une nouvelle candidature sur la même certification pourra être
              créée
            </li>
            <li>
              si un financement a été validé, tournez-vous vers votre
              accompagnateur. La gestion du financement se fait hors plateforme
              France VAE.
            </li>
          </ul>
        </Highlight>
      </div>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
        <div className="pr-[30%]">
          <Select
            label="Motif de l'abandon :"
            nativeSelectProps={{
              ...register("dropOutReasonId"),
              defaultValue: "",
            }}
            state={errors.dropOutReasonId ? "error" : "default"}
            stateRelatedMessage={errors.dropOutReasonId?.message}
          >
            <option value="" disabled>
              Sélectionner une option
            </option>
            {activeDropoutReasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.label}
              </option>
            ))}
          </Select>

          <p className="mb-6 font-bold">
            Confirmez-vous l'abandon de cette candidature ?
          </p>
        </div>

        <div className="flex justify-between">
          <BackButton navigateBack={() => router.push("../")} />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="self-end"
            data-testid="candidacy-dropout-confirm-button"
          >
            Confirmer
          </Button>
        </div>
      </form>
    </Panel>
  );
}
