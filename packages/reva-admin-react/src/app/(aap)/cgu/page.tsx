"use client";

import { Cgu } from "@/app/(aap)/cgu/_components/Cgu";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const zodSchema = z.object({
  cguAcceptance: z.literal<boolean>(true),
});

type CguFormSchema = z.infer<typeof zodSchema>;

export default function CguPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CguFormSchema>({
    resolver: zodResolver(zodSchema),
  });

  const router = useRouter();

  const submitCgu = async () => {
    // Submit CGU version and date
    router.push("/candidacies");
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
          <legend className="text-xl font-bold text-gray-900 mb-8">
            Pour créer votre compte, vous devez accepter les conditions
            générales d'utilisation :
          </legend>
          <Cgu />
          <hr className="mt-12 mb-8" />
          <Checkbox
            options={[
              {
                label:
                  "J'atteste avoir pris connaissance des conditions générales d'utilisation",
                nativeInputProps: {
                  ...register("cguAcceptance"),
                },
              },
            ]}
          />
        </fieldset>
        <div className="flex gap-x-2 justify-end">
          <Button
            priority="tertiary no outline"
            linkProps={{ href: "/candidacies" }}
          >
            Ignorer les nouvelles CGU
          </Button>
          <Button type="submit" disabled={!isValid}>
            Valider les CGU
          </Button>
        </div>
      </form>
    </div>
  );
}
