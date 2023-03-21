import { Footer as DsfrFooter } from "@codegouvfr/react-dsfr/Footer";
export const Footer = (props: { className?: string }) => (
  <DsfrFooter
    className={props.className}
    accessibility="fully compliant"
    brandTop={<></>}
    contentDescription="Reva"
    cookiesManagementLinkProps={{
      href: "#",
    }}
    homeLinkProps={{
      href: "/",
      title: "Accueil - Reva - l'expérimentation de la VAE",
    }}
  />
);
