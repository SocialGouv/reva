import { FC } from "react";

import { Button } from "../components/atoms/Button";
import { Title } from "../components/atoms/Title";
import { ProgressCard } from "../components/molecules/ProgressCard";
import { Direction } from "../components/organisms/Page";
import { PageWithBackground } from "../components/organisms/PageWithBackground";
import { Certification, Organism } from "../interface";

interface Props {
  certification: Certification;
  candidacyCreatedAt?: Date;
  direction: Direction;
  organism: Organism;
}

export const ReviewTrainingProgram: FC<Props> = ({
  certification,
  candidacyCreatedAt,
  direction,
  organism,
}) => {
  return (
    <PageWithBackground
      certification={certification}
      candidacyCreatedAt={candidacyCreatedAt}
      direction={direction}
    >
      <ProgressCard progress={100} title="Projet validé" theme="light">
        <section className="mt-2" data-test="review-training-form">
          <Title
            label="Mon parcours personnalisé"
            size={"small"}
            theme={"light"}
          />
          <div className="mt-3">Consultez de nouveau votre parcours</div>
          <div className="mt-3">
            <Button
              label="Voir mon parcours"
              size="tiny"
              data-test="review-button"
            />
          </div>
        </section>

        <section className="mt-2" data-test="ap-organism">
          <Title
            label="Mon architecte de parcours"
            size={"small"}
            theme={"light"}
          />
          <div className="text-md font-medium">{organism.label}</div>
          <address className="mt-1 text-gray-600 not-italic">
            <div>{organism.address}</div>
            <div>
              <span>{organism.zip}</span>
              <span className="ml-2">{organism.city}</span>
            </div>
          </address>
          <div className="mt-1 text-gray-600">
            {organism.contactAdministrativeEmail}
          </div>
        </section>
      </ProgressCard>
    </PageWithBackground>
  );
};
