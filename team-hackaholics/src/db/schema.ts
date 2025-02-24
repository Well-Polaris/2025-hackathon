import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const documentEmbeddings = pgTable("document_embeddings", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  content: text("content").notNull(),
  embedding: text("embedding").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
