import { redirect } from "next/navigation";

const PrivacyPolicyPage = async () => {
  // L'URL a changé. Redirection mise en place afin de ne pas casser les liens existants pointant vers cette page.
  redirect("/legal/donnees-personnelles-et-cookies/");
};
export default PrivacyPolicyPage;
