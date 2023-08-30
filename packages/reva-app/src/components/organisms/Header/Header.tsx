import { Button } from "@codegouvfr/react-dsfr/Button";
import {
  Header as DsfrHeader,
  HeaderProps,
} from "@codegouvfr/react-dsfr/Header";
import { useKeycloakContext } from "contexts/keycloakContext";

export const Header = (props: { className?: string }) => {
  const keycloakContext = useKeycloakContext();

  const quickAccessItems: (React.ReactNode | HeaderProps.QuickAccessItem)[] =
    [];

  if (keycloakContext?.token) {
    quickAccessItems.push(
      <div className="fr-header__tools">
        <div className="fr-header__tools-links">
          <span className="fr-btns-group">
            <Button
              iconId="fr-icon-logout-box-r-line"
              onClick={keycloakContext.logout}
            >
              Se déconnecter
            </Button>
          </span>
        </div>
      </div>
    );
  }

  return (
    <DsfrHeader
      className={props.className}
      brandTop={
        <>
          République
          <br /> Française
        </>
      }
      operatorLogo={{
        alt: "France VAE",
        imgUrl: "/app/fvae_logo.svg",
        orientation: "horizontal",
      }}
      classes={{ operator: "min-w-[9.0625rem]" }}
      homeLinkProps={{
        href: "/",
        title: "Accueil - France VAE",
      }}
      quickAccessItems={quickAccessItems}
    />
  );
};
