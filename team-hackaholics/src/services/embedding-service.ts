import { DocumentReference, Resource } from "@medplum/fhirtypes";
import { drizzle } from "drizzle-orm/postgres-js";
import { OpenAI } from "openai";
import postgres from "postgres";
import * as schema from "../db/schema";
import { sql } from "drizzle-orm";
// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

function connectToDb() {
  const queryClient = postgres(process.env.DATABASE_URL!);
  const db = drizzle(queryClient, { schema });
  return db;
}

export async function processEmbeddingsForFhirResource(
  resource: Resource & { subject?: { reference?: string } }
) {
  if (!resource || !resource.resourceType) {
    throw new Error("Invalid FHIR resource");
  }

  // Extract patient ID from the resource
  const patientId =
    resource.resourceType === "Patient"
      ? resource.id
      : resource.subject?.reference?.split("/")[1];
  if (!patientId) {
    return { error: "Missing patient reference" };
  }

  // Extract text content based on resource type
  let textContentForEmbedding = "";
  if (resource.resourceType === "DocumentReference") {
    textContentForEmbedding =
      (resource as DocumentReference).content?.[0]?.attachment?.data || "";
  } else if ((resource as { text: { div: string } }).text) {
    const fhirResourceWithText = resource as { text: { div: string } };
    textContentForEmbedding = fhirResourceWithText.text?.div || "";
  } else {
    textContentForEmbedding = JSON.stringify(resource);
  }

  // Generate embedding using OpenAI
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: textContentForEmbedding,
    encoding_format: "float",
  });
  console.log("got embedding", embeddingResponse.data[0].embedding);
  // Store in database
  const db = connectToDb();
  await db.insert(schema.documentEmbeddings).values({
    id: resource.id || "",
    patientId,
    resourceType: resource.resourceType,
    content: textContentForEmbedding,
    embedding: sql`${JSON.stringify(embeddingResponse.data[0].embedding)}::vector(1536)`,
  });

  return { message: "Successfully processed embedding" };
}

export async function embeddingSearch(text: string, patientId: string) {
  if (!text || !patientId) {
    throw new Error("Missing required parameters");
  }

  // Generate embedding for search text
  const embeddingResponse = await openai.embeddings.create({
    model: model,
    input: text,
  });
  const searchEmbedding = embeddingResponse.data[0].embedding;

  // Perform vector similarity search
  const db = connectToDb();
  return await db.execute(
    sql`
    SELECT content, 1 - (embedding <=> ${sql`${JSON.stringify(searchEmbedding)}::vector(1536)`}) as similarity
    FROM document_embeddings
    WHERE patient_id = ${patientId}
    ORDER BY embedding <=> ${sql`${JSON.stringify(searchEmbedding)}::vector(1536)`}
    LIMIT 5
    `
  );
}
