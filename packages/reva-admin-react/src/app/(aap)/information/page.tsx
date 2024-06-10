"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";

export default function InformationPage() {
  return (
    <>
      <div className="[&_p]:text-xl [&_p]:leading-relaxed">
        <h1>Page d'information</h1>
        <p>Lorem ipsum dolor sit amet,</p>
        <p>
          Consectetur adipiscing elit. Integer quam elit, lacinia sed
          consectetur a, pharetra sed metus. Suspendisse ultrices quis enim ut
          cursus. Ut volutpat, est id aliquet tempor, purus sapien rhoncus
          neque.
        </p>
        <hr className="mt-12 mb-6" />
      </div>
      <div className="[&_p]:text-lg">
        <h2>1 - Lorem ipsum</h2>
        <p>
          Donec quis sem mollis, posuere nisi tristique, fermentum nisl. Cras
          porta metus vel lacus congue, a ullamcorper elit porta. Curabitur
          porta tempus tellus a posuere. Vivamus laoreet sed nibh at tincidunt.
        </p>
        <ul className="text-lg">
          <li>sed augue ante</li>
          <li>consectetur molestie blandit vel</li>
          <li>ullamcorper id nunc</li>
        </ul>
        <p>
          Maecenas at sem diam. Quisque laoreet turpis quis ligula venenatis,
          vitae dapibus tellus sodales. Praesent vulputate quam ante, sed
          condimentum diam dignissim et.
        </p>
        <h2>2 - Lorem ipsum</h2>
        <p>
          <strong>Amet odio finibus vestibulum et vitae diam</strong>
        </p>
        <p>
          Sed pharetra, turpis eget accumsan iaculis, massa risus eleifend odio,
          eget ultricies turpis tellus sit amet ipsum. Curabitur augue arcu,
          semper eu augue id.
        </p>
        <p>
          <strong>Congue velit a justo</strong>
        </p>
        <p>
          Mauris vitae odio et magna varius aliquet sit amet id mauris. Nullam
          porta nunc hendrerit, faucibus libero at, aliquet mauris.
        </p>
        <hr className="mt-12 mb-6" />
      </div>
      <div className="w-full flex justify-end">
        <Button priority="primary" linkProps={{ href: "/cgu" }}>
          Suivant
        </Button>
      </div>
    </>
  );
}
