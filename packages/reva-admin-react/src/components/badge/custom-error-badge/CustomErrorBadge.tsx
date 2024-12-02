export const CustomErrorBadge = ({
  label,
  dataTest,
}: {
  label: string;
  dataTest?: string;
}): JSX.Element => (
  <div data-test={dataTest}>
    <div
      className={`text-[#6E445A] bg-[#FEE7FC] inline-flex items-center gap-1 rounded px-1 h-6 hide-bg-for-pdf`}
    >
      <label className={`text-sm font-bold`}>{label.toUpperCase()}</label>
    </div>
  </div>
);
