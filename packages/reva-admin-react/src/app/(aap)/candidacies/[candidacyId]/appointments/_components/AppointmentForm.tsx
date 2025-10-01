import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";

const appointmentFormSchema = z.object({
  title: z.string().min(1, "Merci de remplir ce champ"),
  date: z.string().min(1, "Merci de remplir ce champ"),
  time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export const AppointmentForm = ({
  onSubmit,
  backUrl,
}: {
  backUrl: string;
  onSubmit: (data: AppointmentFormData) => void;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
  });

  return (
    <form
      className="w-full grid grid-cols-1 md:grid-cols-4 gap-x-4"
      onSubmit={handleSubmit(onSubmit, (e) => console.error(e))}
    >
      <Input
        label="Intitulé :"
        className="col-span-full"
        nativeInputProps={{ ...register("title") }}
        state={errors.title ? "error" : "default"}
        stateRelatedMessage={errors.title?.message}
      />
      <Input
        label="Date :"
        nativeInputProps={{ type: "date", ...register("date") }}
        state={errors.date ? "error" : "default"}
        stateRelatedMessage={errors.date?.message}
      />
      <Input
        label="Heure : (Optionnel)"
        nativeInputProps={{ type: "time", ...register("time") }}
        state={errors.time ? "error" : "default"}
        stateRelatedMessage={errors.time?.message}
      />
      <Input
        label="Lieu : (Optionnel)"
        hintText="Ajouter une adresse, un lieu ou un lien de visioconférence en fonction de la modalité d’accompagnement envisagée."
        className="col-span-full"
        nativeInputProps={{ ...register("location") }}
        state={errors.location ? "error" : "default"}
        stateRelatedMessage={errors.location?.message}
      />
      <Input
        textArea
        nativeTextAreaProps={{ rows: 3, ...register("description") }}
        label="Description : (Optionnel)"
        className="col-span-full"
        state={errors.description ? "error" : "default"}
        stateRelatedMessage={errors.description?.message}
      />
      <FormButtons
        className="col-span-full"
        backUrl={backUrl}
        backButtonLabel="annuler"
        formState={{ isDirty, isSubmitting }}
        disabled={!isDirty}
      />
    </form>
  );
};
