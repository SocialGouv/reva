import { EmailLink } from "../components/atoms/EmailLink";
import { Title } from "../components/atoms/Title";
import { Page } from "../components/organisms/Page";

interface ProjectDroppedOutProps {
  candidateName: string;
  candidateEmail: string;
  supportEmail: string;
}

export const ProjectDroppedOut = ({
  candidateName,
  candidateEmail,
  supportEmail,
}: ProjectDroppedOutProps) => {
  return (
    <Page
      data-test="home-project-dropped-out"
      title="Abandon de la candidature"
      className="z-[80] overflow-hidden h-full flex flex-col bg-white pt-6"
    >
      <div className="relative overflow-y-auto flex flex-col rounded-xl p-12 text-black leading-loose">
        <Title
          label={`Bonjour ${candidateName},`}
          size="large"
          data-test="home-dropped-out-name"
        />

        <p className="font-bold mt-6" data-test="home-dropped-out-email">
          Email: {candidateEmail}
        </p>

        <p className="mt-8">
          Nous avons enregistré l'interruption de votre parcours.
          <br />
          Nous vous informons que vous ne pourrez pas candidater à nouveau.
        </p>
        <p className="mt-8">
          Vous avez une question ?{" "}
          <EmailLink
            email={supportEmail}
            data-test="home-dropped-out-support-email"
          />
        </p>
      </div>
    </Page>
  );
};
