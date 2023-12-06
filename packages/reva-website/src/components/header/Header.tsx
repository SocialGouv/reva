import { push } from "@/components/analytics/matomo-tracker/matomoTracker";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useRouter } from "next/router";

export const Header = (props: { className?: string }) => {
  const { asPath } = useRouter();
  const { isFeatureActive } = useFeatureflipping();

  const navigation = [
    {
      isActive: !!asPath.match(/\/espace-candidat/)?.length,
      linkProps: {
        href: "/espace-candidat",
      },
      text: "Je suis candidat",
    },
    {
      isActive: !!asPath.match(/\/espace-professionnel/)?.length,
      linkProps: {
        href: "/espace-professionnel",
      },
      text: "Je suis professionnel de la VAE",
    },
  ];

  if (isFeatureActive("CENTRE_AIDE")) {
    navigation.push({
      isActive: !!asPath.match(/\/savoir-plus/)?.length,
      linkProps: {
        href: "/savoir-plus",
      },
      text: "En savoir plus sur la VAE",
    });
  }

  return (
    <DsfrHeader
      className={props.className}
      brandTop={
        <>
          République
          <br />
          Française
        </>
      }
      homeLinkProps={{
        href: "/",
        title: "Accueil - France VAE",
      }}
      operatorLogo={{
        alt: "France VAE",
        imgUrl: "/fvae_logo.svg",
        orientation: "horizontal",
      }}
      classes={{ operator: "min-w-[9.0625rem]" }}
      quickAccessItems={[
        {
          iconId: "fr-icon-briefcase-fill",
          linkProps: {
            href: "/admin",
            className: "fr-link--icon-right",
            onClick: () =>
              push([
                "trackEvent",
                "En-tête",
                "Click sur 'Espace professionnel'",
                "Click sur 'Espace professionnel'",
              ]),
          },
          text: "Espace professionnel",
        },
        {
          iconId: "fr-icon-account-circle-fill",
          linkProps: {
            href: "/app/login",
            className: "fr-link--icon-right",
            onClick: () =>
              push([
                "trackEvent",
                "En-tête",
                "Click sur 'Espace candidat'",
                "Click sur 'Espace candidat'",
              ]),
          },
          text: "Espace candidat",
        },
      ]}
      navigation={navigation}
    />
  );
};
