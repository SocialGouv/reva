import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

export const Header = (props: { className?: string }) => (
  <DsfrHeader
    className={props.className}
    brandTop={<></>}
    serviceTitle="France VAE"
    homeLinkProps={{
      href: "/",
      title: "Accueil - France VAE",
    }}
    quickAccessItems={[
      {
        iconId: 'fr-icon-add-circle-line',
        linkProps: {
          className: '',
          href: '#', 
        },
        
        text: 'Certifications '
      },
      {
        iconId: 'fr-icon-lock-line',
        linkProps: {
          className: '',
          href: '#'
        },
        text: 'La VAE'
      },
      {
        iconId: 'fr-icon-account-line',
        linkProps: {
          className: '',
          href: '#'
        },
        text: 'Connexion'
      },
      {
        iconId: 'fr-icon-account-line',
        linkProps: {
            className: '!bg-[#F8F8F8]  ',
            href: '#'
        },
        text: 'Pro'
      },
      {
        iconId: 'fr-icon-account-line',
        linkProps: {
            className: '!bg-[#000091] !text-white  ',
            href: '#'
        },
        text: 'Démarrer mon parcours VAE'
      }
    ]}
    // navigation={[
    //   {
    //     linkProps: {
    //       href: "/espace-professionnel/creation",
    //       target: "_self",
    //     },
    //     text: "Espace pro",
    //   },
    //   {
    //     linkProps: {
    //       href: "/espace-professionnel/creation",
    //       target: "_self",
    //     },
    //     text: "Espace prsefsdfo",
    //   },
    // ]}
  />
);

