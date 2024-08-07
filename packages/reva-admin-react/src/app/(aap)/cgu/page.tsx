"use client";

import { Cgu } from "@/app/(aap)/cgu/_components/Cgu";
import { IgnoreCguModalContent } from "@/app/(aap)/cgu/_components/IgnoreCguModalContent";
import { graphqlErrorToast } from "@/components/toast/toast";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppCgu } from "./page.hooks";

const zodSchema = z.object({
  cguAcceptance: z.literal<boolean>(true),
});

type CguFormSchema = z.infer<typeof zodSchema>;

const modalIgnoreCgu = createModal({
  id: "modal-ignore-cgu",
  isOpenedByDefault: false,
});

export default function CguPage() {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<CguFormSchema>({
    resolver: zodResolver(zodSchema),
  });

  const router = useRouter();

  const { acceptMaisonMereCgu } = useAppCgu();

  const queryClient = useQueryClient();

  const submitCgu = async () => {
    try {
      await acceptMaisonMereCgu.mutateAsync();
      queryClient.invalidateQueries({
        queryKey: ["getMaisonMereCGUQuery"],
      });
      router.push("/candidacies");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div>
      <h1>Conditions générales d'utilisation</h1>
      <p className="text-light-text-mention-grey text-xs leading-5 -mt-6">
        Sauf mention contraire “(optionnel)” dans le label, tous les champs sont
        obligatoires.
      </p>
      <form onSubmit={handleSubmit(submitCgu)}>
        <fieldset>
          <Cgu />
          <hr className="mt-12 mb-8" />
          <Checkbox
            options={[
              {
                label:
                  "J’accepte les nouvelles conditions générales d’utilisation.",
                nativeInputProps: {
                  ...register("cguAcceptance"),
                },
              },
            ]}
          />
        </fieldset>
        <div className="flex gap-x-2 justify-end">
          <Button
            type="button"
            priority="tertiary no outline"
            onClick={modalIgnoreCgu.open}
          >
            Ignorer les CGU
          </Button>
          <Button type="submit" disabled={!isValid}>
            Valider les CGU
          </Button>
        </div>
      </form>
      <modalIgnoreCgu.Component
        size="large"
        iconId="fr-icon-arrow-right-line"
        title=" Que se passe-t-il si vous ignorez les nouvelles CGU ?"
        buttons={[
          {
            linkProps: { href: "/candidacies" },
            children: "Ignorer les CGU",
          },

          {
            children: "Relire les CGU",
          },
        ]}
      >
        <IgnoreCguModalContent />
      </modalIgnoreCgu.Component>
    </div>
  );
}
