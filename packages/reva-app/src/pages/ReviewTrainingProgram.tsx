import { FC } from "react";

import { Button } from "../components/atoms/Button";
import { Title } from "../components/atoms/Title";
import { ProgressCard } from "../components/molecules/ProgressCard";
import { Direction } from "../components/organisms/Page";
import { PageWithBackground } from "../components/organisms/PageWithBackground";
import { Certification, Organism } from "../interface";

interface Props {
  certification: Certification;
  date: Date;
  direction: Direction;
  organism: Organism;
}

export const ReviewTrainingProgram: FC<Props> = ({
  certification,
  date,
  direction,
  organism,
}) => {
  return (
    <PageWithBackground
      certification={certification}
      date={date}
      direction={direction}
    >
      <ProgressCard progress={100} title="Projet validé" theme="light">
        <section className="mt-7">
          <Title
            label="Mon parcours personnalisé"
            size={"small"}
            theme={"light"}
          />
          <div className="mt-3">Consultez de nouveau votre parcours</div>
          <div className="mt-3">
            <Button label="Voir mon parcours" size="tiny" />
          </div>
        </section>

        <section className="mt-7">
          <Title
            label="Mon architecte de parcours"
            size={"small"}
            theme={"light"}
          />
          <div className="text-md font-medium">{organism.label}</div>
          <address className="mt-1 text-gray-600">
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
