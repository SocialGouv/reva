import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";

import { AppointmentTiles } from "./appointments/AppointmentTiles";
import { ContactTiles } from "./contacts/ContactTiles";
import { NextActionTiles } from "./next-actions/NextActionTiles";

export const DashboardSidebar = ({
  candidacy,
  className,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-col gap-y-8 ${className || ""}`}
      data-testid="dashboard-sidebar"
    >
      <NextActionTiles candidacy={candidacy} />
      <AppointmentTiles candidacy={candidacy} />
      <ContactTiles candidacy={candidacy} />
    </div>
  );
};
