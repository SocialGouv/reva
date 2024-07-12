import { createAccount } from "../../account/features/createAccount";
import { CreateOrganismAccountInput } from "../organism.types";

export const createOrganismAccount = async ({
  organismId,
  accountEmail,
  accountFirstname,
  accountLastname,
}: CreateOrganismAccountInput) =>
  createAccount({
    email: accountEmail,
    username: accountEmail,
    firstname: accountFirstname,
    lastname: accountLastname,
    group: "organism",
    organismId,
  });
