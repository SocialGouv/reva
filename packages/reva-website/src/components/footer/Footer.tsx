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
      title: "Accueil - Reva",
    }}
    personalDataLinkProps={{
      href: "/confidentialite",
    }}
    termsLinkProps={{
      href: "/mentions-legales",
    }}
    websiteMapLinkProps={{
      href: "/plan-du-site",
    }}
  />
);
