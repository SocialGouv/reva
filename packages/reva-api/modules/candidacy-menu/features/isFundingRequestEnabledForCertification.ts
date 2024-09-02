const rncpIdsOfCertificationsWithFundingRequestEnabled = [
  "36805",
  "37795",
  "34691",
  "37780",
  "34690",
  "37792",
  "34692",
  "35830",
  "35832",
  "492",
  "4503",
  "34826",
  "35028",
  "37676",
  "34825",
  "37679",
  "34827",
  "36004",
  "36938",
  "37231",
  "12296",
  "12301",
  "36836",
  "37274",
  "37715",
  "35506",
  "35993",
  "35513",
  "37675",
  "34824",
  "38565",
  "28048",
  "38390",
  "25085",
  "36788",
  "13905",
];

export const isFundingRequestEnabledForCertification = ({
  certificationRncpId,
}: {
  certificationRncpId: string;
}) =>
  rncpIdsOfCertificationsWithFundingRequestEnabled.includes(
    certificationRncpId,
  );
