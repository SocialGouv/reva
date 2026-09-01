import { addCertification } from "../modules/referential/features/addCertification";
import { sendCertificationToRegistryManager } from "../modules/referential/features/sendCertificationToRegistryManager";
import { updateCertificationStructureAndCertificationAuthorities } from "../modules/referential/features/updateCertificationStructureAndCertificationAuthorities";

const USAGE =
  "Usage: tsx scripts/addAndSendCertificationsToRegistryManager.ts <certificationAuthorityStructureId> <rncpCode1> <rncpCode2> ...";

const addAndSendCertificationsToRegistryManager = async (
  certificationAuthorityStructureId: string,
  codesRncp: string[],
) => {
  const results: {
    codeRncp: string;
    status: "ok" | "error";
    error?: string;
  }[] = [];

  for (const codeRncp of codesRncp) {
    try {
      const certification = await addCertification({ codeRncp });
      await updateCertificationStructureAndCertificationAuthorities({
        certificationId: certification.id,
        certificationAuthorityStructureId,
        certificationAuthorityIds: [],
      });
      await sendCertificationToRegistryManager({
        certificationId: certification.id,
      });
      results.push({ codeRncp, status: "ok" });
      console.log(`[${codeRncp}] OK`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ codeRncp, status: "error", error: message });
      console.error(`[${codeRncp}] ERROR: ${message}`);
    }
  }

  const successCount = results.filter((r) => r.status === "ok").length;
  const errorCount = results.length - successCount;
  console.log(`\nDone. ${successCount} succeeded, ${errorCount} failed.`);

  if (errorCount > 0) {
    console.log("Failures:");
    for (const { codeRncp, error } of results.filter(
      (r) => r.status === "error",
    )) {
      console.log(`  - ${codeRncp}: ${error}`);
    }
  }
};

const main = async () => {
  const [certificationAuthorityStructureId, ...codesRncp] =
    process.argv.slice(2);

  if (!certificationAuthorityStructureId || codesRncp.length === 0) {
    console.error(USAGE);
    process.exit(1);
  }

  await addAndSendCertificationsToRegistryManager(
    certificationAuthorityStructureId,
    codesRncp,
  );
};

main();
