import { OrganismUseSubmitCandidacyForDashboard } from "./submit-candidacy-dashboard.hook";

export default function ContactSectionSubmitCandidacy({
  organism,
}: {
  organism: OrganismUseSubmitCandidacyForDashboard;
}) {
  if (!organism) return null;

  const {
    nomPublic,
    label,
    adresseVille,
    adresseNumeroEtNomDeRue,
    adresseInformationsComplementaires,
    adresseCodePostal,
    emailContact,
    contactAdministrativeEmail,
    telephone,
    contactAdministrativePhone,
  } = organism;

  const adresse = `${adresseNumeroEtNomDeRue ?? ""} ${adresseInformationsComplementaires ?? ""} - ${adresseCodePostal ?? ""} ${adresseVille ?? ""}`;
  const email = emailContact || contactAdministrativeEmail;
  const phone = telephone || contactAdministrativePhone;
  const name = nomPublic || label;

  return (
    <div className="p-6 border-[1px] border-b-4 border-b-black mt-10">
      <p className="font-bold mb-1">Mon accompagnateur</p>
      <p className="mb-1">{name}</p>
      <p className="mb-1 text-sm">{adresse}</p>
      <p className="mb-1 text-sm">{email}</p>
      <p className="mb-0 text-sm">{phone}</p>
    </div>
  );
}
