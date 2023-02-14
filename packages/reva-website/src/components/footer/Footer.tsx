import { Footer as DsfrFooter } from "@codegouvfr/react-dsfr/Footer";
export const Footer = (props: { className?: string }) => (
  <DsfrFooter
    className={props.className}
    accessibility="fully compliant"
    brandTop={<></>}
    contentDescription="Le site officiel de la VAE"
    cookiesManagementLinkProps={{
      href: "#",
    }}
    homeLinkProps={{
      href: "/",
      title: "Accueil - France VAE",
    }}
    personalDataLinkProps={{
      href: "#",
    }}
    termsLinkProps={{
      href: "#",
    }}
    websiteMapLinkProps={{
      href: "#",
    }}
  />
);
