import { MedplumClient } from "@medplum/core";

export const medplum = new MedplumClient({
  baseUrl: process.env.MEDPLUM_BASE_URL,
});
