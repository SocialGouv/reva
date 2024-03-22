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
import { useFCCertificationQuery } from "../certificationQueries";
import { v4 } from "uuid";
import { SortableList } from "@/components/sortable-list";

const UpdateCompetenceBlocsForm = ({
  codeRncp,
  blocs,
  onSubmit,
}: {
  codeRncp: string;
  blocs: CertificationCompetenceBloc[];
  onSubmit: (blocs: CompetenceBlocInput[]) => void;
}) => {
  const { getFCCertification } = useFCCertificationQuery();

  const [competenceBlocs, setCompetenceBlocs] =
    useState<(CertificationCompetenceBloc & { created?: boolean })[]>(blocs);

  const reset = () => {
    const resetedBlocs: (CertificationCompetenceBloc & {
      created?: boolean;
    })[] = blocs.map((bloc) => ({
      ...bloc,
      id: v4(),
      created: true,
    }));

    setCompetenceBlocs(resetedBlocs);
  };

  const resetWithFCCertification = async () => {
    const certification = await getFCCertification(codeRncp);

    const FCBlocs: (CertificationCompetenceBloc & { created?: boolean })[] = (
      certification?.BLOCS_COMPETENCES || []
    ).map((bloc) => ({
      id: v4(),
      code: bloc.CODE,
      label: bloc.LIBELLE,
      isOptional: bloc.FACULTATIF,
      FCCompetences: bloc.LISTE_COMPETENCES,
      competences: bloc.PARSED_COMPETENCES.map((competence) => ({
        id: v4(),
        label: competence,
      })),
      created: true,
    }));

    setCompetenceBlocs(FCBlocs);
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

  const addBloc = () => {
    const updatedBlocs = [
      ...competenceBlocs,
      {
        created: true,
        id: v4(),
        label: "Renseigner un libéllé",
        isOptional: false,
        competences: [
          {
            id: v4(),
            label: "",
          },
        ],
      },
    ];

    setCompetenceBlocs(updatedBlocs);
  };

  const updateBloc = (blocId: string, label: string) => {
    const updatedBlocs = competenceBlocs.map((bloc) =>
      bloc.id == blocId ? { ...bloc, label } : bloc,
    );

    setCompetenceBlocs(updatedBlocs);
  };

  const removeBloc = (blocId: string) => {
    const updatedBlocs = competenceBlocs.filter((bloc) => bloc.id != blocId);

    setCompetenceBlocs(updatedBlocs);
  };

  const sortCompetencesForBlocId = (
    blocId: string,
    competences: CertificationCompetence[],
  ) => {
    const updatedBlocs = competenceBlocs.map((bloc) =>
      bloc.id == blocId ? { ...bloc, competences } : bloc,
    );

    setCompetenceBlocs(updatedBlocs);
  };

  const addCompetence = (blocId: string) => {
    const updatedBlocs = competenceBlocs.map((bloc) => {
      const competences: CertificationCompetence[] = bloc.competences;
      if (bloc.id == blocId) {
        competences.push({
          id: v4(),
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
      id: bloc.created ? undefined : bloc.id,
      code: bloc.code,
      label: bloc.label,
      isOptional: bloc.isOptional,
      FCCompetences: bloc.FCCompetences,
      competences: bloc.competences.map((c) => c.label),
    }));

    onSubmit(blocs);
  };

  const [editingBlocId, setEditingBlocId] = useState<string | undefined>(
    undefined,
  );

  return (
    <form
      className="flex flex-col gap-12"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (editingBlocId) {
          return;
        }

        handleFormSubmit();
      }}
      onReset={(e) => {
        e.preventDefault();

        reset();
      }}
    >
      <Button
        type="button"
        iconId="fr-icon-refresh-fill"
        className="mt-2"
        onClick={() => resetWithFCCertification()}
        priority="tertiary"
        title="Label button"
      >
        Réinitialiser à partir de France Compétences
      </Button>

      {competenceBlocs.map((bloc) => (
        <div key={bloc.id}>
          <div className="flex items-center mb-2 gap-2">
            {editingBlocId == bloc.id ? (
              <>
                <Input
                  label=""
                  className="!mb-0 flex-1"
                  nativeInputProps={{
                    autoFocus: true,
                    defaultValue: bloc.label,
                    onBlur: (e) => {
                      updateBloc(bloc.id, e.target.value);
                      setEditingBlocId(undefined);
                    },
                  }}
                />

                <Button
                  type="button"
                  iconId="fr-icon-checkbox-circle-fill"
                  priority="tertiary no outline"
                  title="Label button"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold m-0">{bloc.label}</h2>
                <Button
                  type="button"
                  iconId="fr-icon-pencil-fill"
                  onClick={() => setEditingBlocId(bloc.id)}
                  priority="tertiary no outline"
                  title="Label button"
                />

                <div className="flex-1" />

                <Button
                  type="button"
                  iconId="fr-icon-delete-fill"
                  onClick={() => removeBloc(bloc.id)}
                  priority="tertiary no outline"
                  title="Label button"
                />
              </>
            )}
          </div>

          {bloc.FCCompetences && (
            <div className="px-4 py-4 bg-neutral-100 flex-1 mr-[40px]">
              {bloc.FCCompetences}
            </div>
          )}

          <Checkbox
            className="mt-6"
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

          <SortableList
            items={bloc.competences}
            onChange={(items) => sortCompetencesForBlocId(bloc.id, items)}
            renderItem={(competence) => (
              <SortableList.Item
                className="flex items-center gap-2"
                id={competence.id}
                key={competence.id}
              >
                <SortableList.DragHandle className="mt-2" />

                <Input
                  label=""
                  className="!mb-0 flex-1"
                  nativeInputProps={{
                    defaultValue: competence.label,
                    onBlur: (e) => {
                      updateCompetence(competence.id, e.target.value);
                    },
                  }}
                />

                <Button
                  type="button"
                  iconId="fr-icon-delete-fill"
                  className="mt-2"
                  onClick={() => updateCompetence(competence.id)}
                  priority="tertiary no outline"
                  title="Label button"
                />
              </SortableList.Item>
            )}
          />

          <div className="flex flex-row-reverse mt-2">
            <Button
              type="button"
              iconId="fr-icon-add-circle-fill"
              onClick={() => addCompetence(bloc.id)}
              priority="tertiary no outline"
              title="Label button"
            />
          </div>
        </div>
      ))}
      <div className="flex flex-row gap-4 items-center">
        <Button
          type="button"
          onClick={() => {
            addBloc();
          }}
        >
          Ajouter un bloc de compétences
        </Button>
        <div className="flex-1" />
        <Button priority="secondary" type="reset">
          Annuler les modifications
        </Button>
        <Button>Valider</Button>
      </div>
    </form>
  );
};

export default UpdateCompetenceBlocsForm;
