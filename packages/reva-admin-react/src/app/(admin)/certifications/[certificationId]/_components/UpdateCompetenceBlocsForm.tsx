"use client";
import { useState } from "react";
import {
  CertificationCompetence,
  CertificationCompetenceBloc,
  CompetenceBlocInput,
} from "@/graphql/generated/graphql";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

const UpdateCompetenceBlocsForm = ({
  blocs,
  onSubmit,
}: {
  blocs: CertificationCompetenceBloc[];
  onSubmit: (blocs: CompetenceBlocInput[]) => void;
}) => {
  const [competenceBlocs, setCompetenceBlocs] =
    useState<CertificationCompetenceBloc[]>(blocs);

  const reset = () => {
    setCompetenceBlocs(blocs);
  };

  const updateCompetence = (competenceId: string, label?: string) => {
    const updatedBlocs = competenceBlocs.map((bloc) => {
      let competences: CertificationCompetence[] = [];
      if (label == undefined) {
        competences = bloc.competences.filter(
          (competence) => competence.id != competenceId,
        );
      } else {
        competences = bloc.competences.map((competence) =>
          competence.id == competenceId ? { ...competence, label } : competence,
        );
      }

      return {
        ...bloc,
        competences,
      };
    });

    setCompetenceBlocs(updatedBlocs);
  };

  const addCompetence = (blocId: string) => {
    const updatedBlocs = competenceBlocs.map((bloc) => {
      const competences: CertificationCompetence[] = bloc.competences;
      if (bloc.id == blocId) {
        competences.push({
          id: `${Date.now()}`,
          label: "",
        });
      }

      return {
        ...bloc,
        competences,
      };
    });

    setCompetenceBlocs(updatedBlocs);
  };

  const setBlocHasOptional = (blocId: string, isOptional: boolean) => {
    const updatedBlocs = competenceBlocs.map((bloc) => {
      return {
        ...bloc,
        isOptional: bloc.id == blocId ? isOptional : bloc.isOptional,
      };
    });

    setCompetenceBlocs(updatedBlocs);
  };

  const handleFormSubmit = () => {
    const blocs: CompetenceBlocInput[] = competenceBlocs.map((bloc) => ({
      id: bloc.id,
      isOptional: bloc.isOptional,
      competences: bloc.competences.map((c) => c.label),
    }));

    onSubmit(blocs);
  };

  return (
    <form
      className="flex flex-col gap-12"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        handleFormSubmit();
      }}
      onReset={(e) => {
        e.preventDefault();

        reset();
      }}
    >
      {competenceBlocs.map((bloc) => (
        <div key={bloc.id}>
          <h2 className="text-xl font-bold mb-2 flex-1">{bloc.label}</h2>

          <div className="mb-6 px-4 py-4 bg-neutral-100 flex-1 mr-[40px]">
            {bloc.FCCompetences}
          </div>

          <Checkbox
            legend="Facultatif"
            orientation="horizontal"
            options={[
              {
                label: "Oui",
                nativeInputProps: {
                  checked: !!bloc.isOptional,
                  onChange: () => {
                    setBlocHasOptional(bloc.id, true);
                  },
                },
              },
              {
                label: "Non",
                nativeInputProps: {
                  checked: !bloc.isOptional,
                  onChange: () => {
                    setBlocHasOptional(bloc.id, false);
                  },
                },
              },
            ]}
          />

          {bloc.competences.map((competence) => (
            <div key={competence.id} className="flex items-center">
              <Input
                label=""
                className="!mb-0 flex-1"
                nativeInputProps={{
                  value: competence.label,
                  onChange: (e) => {
                    updateCompetence(competence.id, e.target.value);
                  },
                }}
              />

              <Button
                iconId="fr-icon-delete-fill"
                className="mt-2"
                onClick={() => updateCompetence(competence.id)}
                priority="tertiary no outline"
                title="Label button"
              />
            </div>
          ))}

          <div className="flex flex-row-reverse mt-2">
            <Button
              iconId="fr-icon-add-circle-fill"
              onClick={() => addCompetence(bloc.id)}
              priority="tertiary no outline"
              title="Label button"
              type="button"
            />
          </div>
        </div>
      ))}

      <div className="flex flex-col md:flex-row gap-4 items-center md:col-start-2 md:ml-auto md:mt-8">
        <Button priority="secondary" type="reset">
          Annuler les modifications
        </Button>
        <Button>Valider</Button>
      </div>
    </form>
  );
};

export default UpdateCompetenceBlocsForm;
