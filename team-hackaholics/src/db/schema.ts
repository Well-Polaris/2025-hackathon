import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

// Create a custom type for vector
const vector = customType<{ data: number[] }>({
  dataType() {
    return "vector(1536)";
  },
});

export const documentEmbeddings = pgTable("document_embeddings", {
  id: varchar("id").primaryKey(),
  patientId: varchar("patient_id").notNull(),
  resourceType: varchar("resource_type").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding").notNull(),
});
