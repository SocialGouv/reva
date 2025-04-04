import { ReactNode } from "react";

interface DashboardTilesSectionProps {
  title: string;
  icon: string;
  children: ReactNode;
  badge?: ReactNode;
}

export const DashboardTilesSection = ({
  title,
  icon,
  children,
  badge,
}: DashboardTilesSectionProps) => (
  <div className="col-span-1 lg:col-span-2 row-span-1 h-fit shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
    <div className="bg-white p-4 pl-6 border-b-2">
      <p className="text-xl font-bold my-0 leading-loose inline-block">
        <span className={icon} /> {title}
      </p>
      {badge && <span className="align-middle inline-block ml-2">{badge}</span>}
    </div>
    {children}
  </div>
);
