import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

export const metadata = {
  title: "Nous contacter - France VAE",
};

const IndexNousContacterPage = () => {
  return (
    <MainLayout>
      <div className="fr-container text-center pt-20">
        <h1>Nous contacter</h1>
        <iframe
          title="Nous contacter - France VAE"
          src="https://plugins.crisp.chat/urn:crisp.im:contact-form:0/contact/5d4404d7-da05-42b9-8e06-1e56d8c150b0"
          referrerPolicy="origin"
          sandbox="allow-forms allow-popups allow-scripts allow-same-origin"
          width="100%"
          height="780px"
          frameBorder="0"
        ></iframe>
      </div>
    </MainLayout>
  );
};

export default IndexNousContacterPage;
