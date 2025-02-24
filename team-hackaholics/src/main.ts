import { medplum } from "./config/medplum";
import {
  embeddingSearch,
  processEmbeddingsForFhirResource,
} from "./services/embedding-service";

async function main() {
  // Sign in to Medplum
  await medplum.startClientLogin(
    process.env.MEDPLUM_CLIENT_ID!,
    process.env.MEDPLUM_CLIENT_SECRET!
  );

  const patientId = process.env.PATIENT_ID;
  if (!patientId) {
    throw new Error("PATIENT_ID is not set");
  }
  const patient = await medplum.searchOne("Patient", {
    _id: patientId,
  });
  if (!patient) {
    throw new Error("Patient not found");
  }
  console.log("Retrieved patient:", patient);

  const result = await processEmbeddingsForFhirResource(patient);
  console.log("Embedding Result:", result);

  const searchResult = await embeddingSearch(
    "What is the patient's name?",
    patientId
  );
  console.log("Embedding Search Result:", searchResult);
}

main().catch(console.error);
