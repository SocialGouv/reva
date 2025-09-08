import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";

import { AppointmentTiles } from "./appointments/AppointmentTiles";
import { ContactTiles } from "./contacts/ContactTiles";

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
      data-test="dashboard-sidebar"
    >
      <AppointmentTiles candidacy={candidacy} />
      <ContactTiles candidacy={candidacy} />
    </div>
  );
};
