CREATE TABLE "document_embeddings" (
	"id" varchar PRIMARY KEY NOT NULL,
	"patient_id" varchar NOT NULL,
	"resource_type" varchar NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
