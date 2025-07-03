"use server";

import { redirect } from "next/navigation";

export const login = async (formData: FormData) => {
  console.log({ formData });
  redirect("/");
};
