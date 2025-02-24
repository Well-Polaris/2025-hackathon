import { Handler } from "@netlify/functions";
import { processEmbeddingsForFhirResource } from "../../services/embedding-service";

export const handleFhirSubscription: Handler = async (event) => {
  try {
    if (event.body === null) {
      return { statusCode: 400, body: "Missing body" };
    }

    const payload = JSON.parse(event.body);
    const result = await processEmbeddingsForFhirResource(payload.resource);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
