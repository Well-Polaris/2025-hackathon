#!/usr/bin/env node

/**
 * This is a FHIR MCP server implementation that provides access to FHIR resources.
 * It supports:
 * - Reading FHIR resources
 * - Searching FHIR resources
 * - Retrieving CapabilityStatement
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ReadResourceRequest,
  CallToolRequest,
  ReadResourceResult,
  CallToolResult
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';

interface FHIRConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
}

const config: FHIRConfig = {
  baseUrl: process.env.FHIR_BASE_URL || '',
  clientId: process.env.FHIR_CLIENT_ID || '',
  clientSecret: process.env.FHIR_CLIENT_SECRET || '',
  tokenUrl: process.env.FHIR_TOKEN_URL || '',
};

let cachedToken: { token: string; expiresAt: number } | null = null;
// FHIR client setup
const fhirClient = axios.create({
  baseURL: config.baseUrl,
  headers: {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json',
  },
});

// Add type for capability statement
interface FHIRCapabilityStatement {
  rest: Array<{
    resource: Array<{
      type: string;
      // Add other relevant fields
    }>;
  }>;
}

let capabilityStatement: FHIRCapabilityStatement | null = null;

const server = new Server(
  {
    name: "@flexpa/mpc-fhir",
    version: "0.0.1",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Cache capability statement
async function getCapabilityStatement() {
  if (!capabilityStatement) {
    const response = await fhirClient.get('/metadata');
    capabilityStatement = response.data;
  }
  return capabilityStatement;
}

/**
 * Handler for listing available FHIR resources based on CapabilityStatement
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const capability = await getCapabilityStatement();
  const resources = capability?.rest[0].resource || [];
  
  return {
    resources: resources.map((resource: any) => ({
      uri: `fhir://${resource.type}`,
      mimeType: "application/fhir+json",
      name: resource.type,
      description: `FHIR ${resource.type} resource`
    }))
  };
});

/**
 * Handler for reading FHIR resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest): Promise<ReadResourceResult> => {
  const url = new URL(request.params.uri);
  const resourceType = url.hostname;
  const id = url.pathname.replace(/^\//, '');

  try {
    const response = await fhirClient.get(`/${resourceType}/${id}`);
    
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/fhir+json",
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch FHIR resource: ${error.message}`);
  }
});

/**
 * Handler that lists available tools for FHIR operations
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_fhir",
        description: "Search FHIR resources",
        inputSchema: {
          type: "object",
          properties: {
            resourceType: {
              type: "string",
              description: "Type of FHIR resource to search"
            },
            searchParams: {
              type: "object",
              description: "Search parameters"
            }
          },
          required: ["resourceType"]
        }
      },
      {
        name: "read_fhir",
        description: "Read an individual FHIR resource",
        inputSchema: {
          type: "object",
          properties: {
            uri: {
              type: "string",
              description: "URI of the FHIR resource to read"
            }
          },
          required: ["uri"]
        }
      }
    ]
  };
});

/**
 * Handler for FHIR operations
 */
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  switch (request.params.name) {
    case "search_fhir": {
      const resourceType = String(request.params.arguments?.resourceType);
      const searchParams = request.params.arguments?.searchParams || {};

      try {
        const response = await fhirClient.get(`/${resourceType}`, { params: searchParams });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to search FHIR resources: ${error.message}`);
      }
    }

    case "read_fhir": {
      const uri = String(request.params.arguments?.uri);
      const url = new URL(uri);
      const resourceType = url.hostname;
      const id = url.pathname.replace(/^\//, '');

      try {
        const response = await fhirClient.get(`/${resourceType}/${id}`);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to fetch FHIR resource: ${error.message}`);
      }
    }

    default:
      throw new Error("Unknown tool");
  }
});

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}



async function getToken(): Promise<string> {
  // Return cached token if it's still valid (with 60-second buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  try {
    const response = await axios.post<TokenResponse>(
      config.tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Cache the token
    cachedToken = {
      token: response.data.access_token,
      expiresAt: Date.now() + (response.data.expires_in * 1000),
    };

    return response.data.access_token;
  } catch (error: any) {
    throw new Error(`Failed to obtain access token: ${error.message}`);
  }
}

async function main() {
  if (!config.baseUrl || !config.clientId || !config.clientSecret || !config.tokenUrl) {
    throw new Error(
      'Required environment variables not set. Please set: FHIR_BASE_URL, FHIR_CLIENT_ID, FHIR_CLIENT_SECRET, FHIR_TOKEN_URL'
    );
  }
  
  // Validate FHIR server connection by fetching capability statement
  await getCapabilityStatement();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Export config and getToken for testing
export { config, getToken };

