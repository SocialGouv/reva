import { format, isAfter } from "date-fns";
import { JuryUseCandidateForDashboard } from "../dashboard.hooks";
import { BaseBanner } from "./BaseBanner";

interface JuryBannerProps {
  jury: NonNullable<JuryUseCandidateForDashboard>;
}

export const JuryBanner = ({ jury }: JuryBannerProps) => {
  const { dateOfSession } = jury;
  const isUpcoming = isAfter(dateOfSession, new Date());

  const content = isUpcoming ? (
    <>
      Le jour-J est programmé ! Votre passage devant le jury aura lieu le{" "}
      {format(dateOfSession, "dd/MM/yyyy")}. Vous trouverez la date, l'heure et
      le lieu de passage sur votre convocation ou dans l'encart "Mes prochains
      rendez-vous". Un empêchement ? Contactez votre certificateur dès à
      présente.
    </>
  ) : (
    <>
      Après votre passage devant le jury, vous recevrez sa décision par e-mail
      sous 15 jours environ. Votre accompagnateur sera lui aussi informé de la
      décision du certificateur.
    </>
  );

  return <BaseBanner content={content} testId="jury-banner" />;
};
