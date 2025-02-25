declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      OPENAI_API_KEY: string;
      OPENAI_EMBEDDING_MODEL?: string;
      MEDPLUM_CLIENT_ID: string;
      MEDPLUM_CLIENT_SECRET: string;
      PATIENT_ID: string;
    }
  }
}

export {}; 