# Team Hackaholics

## Overview
This project shows a demo of 'semantic search' against FHIR resources.

The resources are retrieved from the Polaris Sandbox (Medplum).

Embeddings are generated using an OpenAI embedding model.  These are stored in a Postgres database (see docker-compose.yml for creation of a local Postgres instance).  Vector search is implemented at Postgres as well, using the pgvector extension.

## Quickstart
```bash
docker compose up
npm i
npm run db:generate
npm run db:migrate
npm run main
```

## Querying Postgres/pgvector

pgvector introduces a new vector data type, and a few new functions and operators for working with vectors.

Here's a query to play with the distance operators:
```
select '[1,1]'::vector(2) <-> '[2,2]'::vector(2);
```

Compare this against:
```
select '[1,1]'::vector(2) <=> '[2,2]'::vector(2);
```


