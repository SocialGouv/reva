import { useHome } from "@/app/home.hook";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TUTORIAL_URL_DASHBOARD_AUTONOME =
  "https://scribehow.com/shared/Tutoriel__Candidat_sans_accompagnement_autonome__0NQyq175SDaI0Epy7bdyLA?referrer=documents";
const TUTORIAL_URL_DASHBOARD_ACCOMPAGNE =
  "https://scribehow.com/viewer/Parcours_du_candidat_accompagne__vp9k4YzATvmheao9kAoKjw?back_to=browser";

export const LayoutNotice = () => {
  const pathname = usePathname();
  const isLoginPath = pathname === "/login/";

  const { candidacy } = useHome();

  const candidacyIsAutonome = candidacy?.typeAccompagnement === "AUTONOME";

  if (isLoginPath) {
    return (
      <Notice
        className="absolute left-0 w-full"
        title={
          <>
            <strong>Important : </strong>
            <span className="font-normal">
              Si vous ne vous êtes pas connecté depuis le 30 mars 2025, nous
              vous invitons à{" "}
            </span>
            <Link className="font-normal" href="/forgot-password">
              définir un mot de passe.
            </Link>
          </>
        }
      />
    );
  }

  const tutorialUrl = candidacyIsAutonome
    ? TUTORIAL_URL_DASHBOARD_AUTONOME
    : TUTORIAL_URL_DASHBOARD_ACCOMPAGNE;

  return (
    <Notice
      title={
        <>
          <span>
            Votre espace évolue. Si vous avez besoin d'aide, vous pouvez{" "}
          </span>
          <Link href={tutorialUrl} target="_blank">
            consulter le tutoriel
          </Link>
        </>
      }
      isClosable
      className="absolute w-full left-0"
    />
  );
};
