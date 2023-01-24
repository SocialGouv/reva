import { ChangeEvent } from "react";
import { Competency } from "../../types/types";

export const CompetencyCard =(props: { competency: Competency; isSelected: boolean; onToggle?: (v: ChangeEvent<HTMLInputElement>) => void }) => (
  <label key={props.competency.id} className="relative flex cursor-pointer bg-white p-4 shadow-sm focus:outline-none">
    
    {!!props.onToggle && (<input 
      type="radio" value={props.competency.id} className="sr-only" aria-labelledby="project-type-0-label" aria-describedby="project-type-0-description-0 project-type-0-description-1"
      onChange={props.onToggle}
    />)}
    <span className="flex flex-1">
      <span className="pr-2">
        <span id="project-type-0-label" className="block text-sm font-medium text-gray-900">{props.competency.label}</span>
      </span>
    </span>
    <svg className={`h-5 w-5 text-indigo-600 ${props.isSelected ? "visible" : "invisible"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
    <span className="pointer-events-none absolute -inset-px border border-gray-200" aria-hidden="true"></span>
  </label>
);
