import { redirect } from "next/navigation";

export const metadata = {
  title: "Nous contacter - France VAE",
};

const IndexNousContacterPage = () => {
  redirect("https://francevae.crisp.help/fr/?contact");
};

export default IndexNousContacterPage;
