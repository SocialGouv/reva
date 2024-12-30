"use client";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDropOutDecisionPage } from "./dropOutDecision.hooks";
import { graphqlErrorToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";

const schema = z.object({
  dropOutConfirmed: z.enum(["DROP_OUT_CONFIRMED", "DROP_OUT_CANCELED"], {
    message: "Merci de choisir une option",
  }),
});

type FormData = z.infer<typeof schema>;

export default function CandidacyDropOutDecisionPage() {
  const router = useRouter();
  const { candidacy, updateCandidateCandidacyDropoutDecision } =
    useDropOutDecisionPage();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const dropOutConfirmed = data.dropOutConfirmed === "DROP_OUT_CONFIRMED";
      if (candidacy) {
        await updateCandidateCandidacyDropoutDecision.mutateAsync({
          candidacyId: candidacy?.id,
          dropOutConfirmed,
        });
        dropOutConfirmed
          ? router.push("/candidacy-dropout-decision/dropout-confirmation")
          : router.push("/");
      }
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return (
    <div className="flex flex-col " data-test="candidacy-dropout-decision-page">
      <h1 className="text-dsfrGray-800 mb-0">Abandon du parcours VAE</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl">
        Votre accompagnateur a déclaré l’abandon de votre parcours VAE. Vous
        avez 2 options : accepter l’abandon ou continuer votre parcours.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit(e);
        }}
      >
        <RadioButtons
          options={[
            {
              label: "J’abandonne mon parcours VAE",
              hintText:
                "Ce choix est irréversible. Vous ne pourrez plus reprendre votre parcours.",
              nativeInputProps: {
                className: "drop-out-confirmation-radio-button",
                value: "DROP_OUT_CONFIRMED",
                ...register("dropOutConfirmed"),
              },
            },
            {
              label: "Je continue mon parcours VAE",
              hintText:
                "Votre recevabilité est toujours valable. Reprenez là où vous en êtes ! ",
              nativeInputProps: {
                className: "drop-out-cancelation-radio-button",
                value: "DROP_OUT_CANCELED",
                ...register("dropOutConfirmed"),
              },
            },
          ]}
          state={errors.dropOutConfirmed ? "error" : "default"}
          stateRelatedMessage={errors.dropOutConfirmed?.message}
        />
        <FormButtons
          backUrl="/"
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
