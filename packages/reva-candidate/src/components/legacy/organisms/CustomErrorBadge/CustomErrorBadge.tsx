export const CustomErrorBadge = ({
  label,
  dataTestId,
}: {
  label: string;
  dataTestId?: string;
}) => (
  <div data-testid={dataTestId}>
    <div
      className={`text-[#6E445A] bg-[#FEE7FC] inline-flex items-center gap-1 rounded px-1 h-6`}
    >
      <label className={`text-sm font-bold`}>{label.toUpperCase()}</label>
    </div>
  </div>
);
