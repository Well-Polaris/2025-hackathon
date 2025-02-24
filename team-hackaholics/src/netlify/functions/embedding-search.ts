import { Handler } from "@netlify/functions";
import { embeddingSearch } from "../../services/embedding-service";

export const embeddingSearch: Handler = async (event) => {
  try {
    if (event.body === null) {
      return { statusCode: 400, body: "Missing body" };
    }

    const { text, patientId } = JSON.parse(event.body);
    const results = await embeddingSearch(text, patientId);

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
