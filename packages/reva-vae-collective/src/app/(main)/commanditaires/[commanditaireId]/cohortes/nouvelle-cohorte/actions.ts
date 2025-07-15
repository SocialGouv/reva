"use server";

type FormState = {
  errors?: {
    name?: { message: string };
  };
};

export const createCohort = async (_state: FormState, formData: FormData) => {
  const { name } = Object.fromEntries(formData.entries());

  console.log(name);

  if (!name) {
    return {
      errors: {
        name: { message: "Merci de remplir ce champ" },
      },
    } as FormState;
  }

  if (name.toString().length < 5) {
    return {
      errors: {
        name: { message: "Ce champ doit contenir au moins 5 caractères" },
      },
    } as FormState;
  }

  return {};
};
