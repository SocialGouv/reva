import { CertificationWithPurcentMatch } from "../../types/types";

export const CertificationCard = (props: { certification: CertificationWithPurcentMatch, isLight: boolean }) => (
  <label key={props.certification.id} className="relative flex items-center bg-white p-4 shadow-sm focus:outline-none">
    <span className="flex flex-1">
      <span className="pr-2">
        <span className={`block text-sm font-medium ${props.isLight ? "text-gray-500" : "text-gray-900" }`}>{props.certification.label}</span>
        {props.certification.nb_activities_match > 0 && 
          (<span className={`block text-sm font-ligth ${props.isLight ? "text-gray-400" : "text-gray-700" } mt-2`}>Vous avez {props.certification.nb_activities_match} compétence(s) sur les {props.certification.nb_activities_total} associée(s) à cette certification.</span>)
        }
      </span>
    </span>
    <div className={`flex justify-center items-center p-2 w-10 h-10 ${props.isLight ? "bg-indigo-200" : "bg-indigo-500" } rounded-full text-xs font-semibold text-white`}>
      {props.certification.purcent.toFixed(0)}%
    </div>
    <span className={`pointer-events-none absolute -inset-px border ${props.isLight ? "border-gray-50" : "border-gray-200" }`} aria-hidden="true"></span>
  </label>
);
