import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";

const appointmentFormSchema = z.object({
  title: z.string().min(1, "Merci de remplir ce champ"),
  date: z.string().min(1, "Merci de remplir ce champ"),
  time: z.string().min(1, "Merci de remplir ce champ"),
  duration: z
    .enum([
      "",
      "HALF_AN_HOUR",
      "ONE_HOUR",
      "TWO_HOURS",
      "THREE_HOURS",
      "FOUR_HOURS",
    ])
    .optional()
    .nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export const AppointmentForm = ({
  onSubmit,
  backUrl,
  defaultValues,
}: {
  backUrl: string;
  onSubmit: (data: AppointmentFormData) => void;
  defaultValues?: Partial<AppointmentFormData>;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  return (
    <form
      className="w-full grid grid-cols-1 md:grid-cols-4 gap-x-4"
      onSubmit={handleSubmit(onSubmit, (e) => console.error(e))}
    >
      <Input
        data-test="title-input"
        label="Intitulé :"
        className="col-span-full"
        nativeInputProps={{ ...register("title") }}
        state={errors.title ? "error" : "default"}
        stateRelatedMessage={errors.title?.message}
      />
      <Input
        data-test="date-input"
        label="Date :"
        nativeInputProps={{ type: "date", ...register("date") }}
        state={errors.date ? "error" : "default"}
        stateRelatedMessage={errors.date?.message}
      />
      <Input
        data-test="time-input"
        label="Heure"
        nativeInputProps={{ type: "time", ...register("time") }}
        state={errors.time ? "error" : "default"}
        stateRelatedMessage={errors.time?.message}
      />
      <Select
        data-test="duration-input"
        label="Durée : (Optionnel)"
        nativeSelectProps={{ ...register("duration") }}
        state={errors.time ? "error" : "default"}
        stateRelatedMessage={errors.time?.message}
      >
        <option value=""></option>
        <option value="HALF_AN_HOUR">30 minutes</option>
        <option value="ONE_HOUR">1 heure</option>
        <option value="TWO_HOURS">2 heures</option>
        <option value="THREE_HOURS">3 heures</option>
        <option value="FOUR_HOURS">4 heures</option>
      </Select>
      <Input
        data-test="location-input"
        label="Lieu : (Optionnel)"
        hintText="Ajouter une adresse, un lieu ou un lien de visioconférence en fonction de la modalité d’accompagnement envisagée."
        className="col-span-full"
        nativeInputProps={{ ...register("location") }}
        state={errors.location ? "error" : "default"}
        stateRelatedMessage={errors.location?.message}
      />
      <Input
        data-test="description-input"
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
