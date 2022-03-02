import { TextResult } from "../TextResult";
import certificateImg from "./certificate.png";

interface BlockResult {
  key: string;
  label: string;
  title: string;
}

/**
 * Primary UI component for user interaction
 */
export const BlockResult = ({ label, title, ...props }: BlockResult) => {
  return (
    <div
      className="relative overflow-hidden flex flex-col h-[270px] mt-6 mb-10 pt-6 pb-4 px-8 rounded-2xl shadow-2xl bg-slate-900 text-white"
      {...props}
    >
      {" "}
      <img
        className="absolute left-[-43px] top-[15px] w-[174px]"
        src={certificateImg}
      />
      <div className="grow text-right font-bold">{label}</div>
      <TextResult title={title} color="light" />
    </div>
  );
};
