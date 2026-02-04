import { os } from "@orpc/server";
import { net } from "electron";
import {
  adoConfigInputSchema,
  searchWorkItemsInputSchema,
  getWorkItemInputSchema,
} from "./schemas";

// Logging helper
function log(level: "INFO" | "DEBUG" | "ERROR" | "WARN", message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [ADO-${level}]`;
  if (data !== undefined) {
    console.log(prefix, message, JSON.stringify(data, null, 2));
  } else {
    console.log(prefix, message);
  }
}

// Helper to get basic auth header (same format as git-track)
function getAuthHeader(token: string): string {
  const basicAuth = Buffer.from(`:${token}`).toString("base64");
  return `Basic ${basicAuth}`;
}

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 15000;

// Helper to make authenticated ADO API requests using Electron's net module
async function adoFetch<T>(
  url: string,
  token: string,
  method: "GET" | "POST" = "GET",
  body?: object
): Promise<T> {
  log("INFO", `Starting ${method} request to: ${url}`);
  
  // Log token info (masked for security)
  const tokenLength = token.length;
  const maskedToken = tokenLength > 8 
    ? token.substring(0, 4) + "..." + token.substring(tokenLength - 4)
    : "****";
  log("DEBUG", `Token info: length=${tokenLength}, preview=${maskedToken}`);
  
  if (body) {
    log("DEBUG", "Request body:", body);
  }

  return new Promise<T>((resolve, reject) => {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      log("ERROR", `Request timed out after ${REQUEST_TIMEOUT}ms`);
      reject(new Error(`Request timed out after ${REQUEST_TIMEOUT / 1000} seconds`));
    }, REQUEST_TIMEOUT);

    try {
      const request = net.request({
        method,
        url,
      });

      // Set headers
      request.setHeader("Authorization", getAuthHeader(token));
      request.setHeader("Content-Type", "application/json");

      let responseData = "";

      request.on("response", (response) => {
        log("INFO", `Response received: ${response.statusCode} ${response.statusMessage}`);

        response.on("data", (chunk) => {
          responseData += chunk.toString();
        });

        response.on("end", () => {
          clearTimeout(timeoutId);
          
          log("DEBUG", `Response body length: ${responseData.length} chars`);

          // Check if response looks like HTML (login page redirect)
          if (responseData.trim().startsWith("<!") || responseData.trim().startsWith("<html")) {
            log("ERROR", "Received HTML instead of JSON - likely auth redirect");
            log("ERROR", `Response preview: ${responseData.slice(0, 200)}`);
            reject(new Error("ADO returned login page - token may be invalid or expired"));
            return;
          }

          // Handle non-200 responses
          if (response.statusCode !== 200) {
            log("ERROR", `API Error Response Body: ${responseData}`);
            
            try {
              const errorBody = JSON.parse(responseData);
              log("ERROR", "Parsed error details:", errorBody);
              
              const errorMessage = errorBody.message || 
                                  errorBody.Message || 
                                  errorBody.errorMessage ||
                                  (errorBody.$id && errorBody.innerException?.message) ||
                                  `${response.statusCode} ${response.statusMessage}`;
              
              reject(new Error(`ADO API error (${response.statusCode}): ${errorMessage}`));
            } catch {
              reject(new Error(`ADO API error: ${response.statusCode} ${response.statusMessage} - ${responseData.slice(0, 200)}`));
            }
            return;
          }

          // Parse successful response
          try {
            const parsed = JSON.parse(responseData) as T;
            log("INFO", "Request successful");
            resolve(parsed);
          } catch {
            log("ERROR", "Failed to parse response as JSON");
            log("ERROR", `Response preview: ${responseData.slice(0, 500)}`);
            reject(new Error("ADO returned invalid JSON response"));
          }
        });

        response.on("error", (error) => {
          clearTimeout(timeoutId);
          log("ERROR", "Response stream error:", error);
          reject(error);
        });
      });

      request.on("error", (error) => {
        clearTimeout(timeoutId);
        log("ERROR", "Request error:", { message: error.message, name: error.name });
        reject(new Error(`Network error: ${error.message}`));
      });

      // Send body if present
      if (body) {
        request.write(JSON.stringify(body));
      }

      request.end();
      log("DEBUG", "Request sent, waiting for response...");
    } catch (error) {
      clearTimeout(timeoutId);
      log("ERROR", "Failed to create request:", error);
      reject(error instanceof Error ? error : new Error("Failed to create request"));
    }
  });
}

// Test connection to ADO
export const testConnection = os
  .input(adoConfigInputSchema)
  .handler(async ({ input }) => {
    const { organization, project, token } = input;

    log("INFO", "=== Testing ADO Connection ===");
    log("INFO", `Organization (raw): "${organization}"`);
    log("INFO", `Project (raw): "${project}"`);
    log("DEBUG", `Token provided: ${token ? "Yes" : "No"}`);
    
    // Clean inputs - remove whitespace and URL parts if user pasted full URL
    const cleanOrg = organization.trim()
      .replace(/^https?:\/\//, "")
      .replace(/^dev\.azure\.com\//, "")
      .replace(/\.visualstudio\.com.*$/, "") // Handle legacy URL format
      .replace(/\/$/, "")
      .split("/")[0]; // Take first part if they pasted a full path
    
    const cleanProject = project.trim()
      .replace(/\/$/, "");
    
    const cleanToken = token.trim();
    
    log("INFO", `Organization (cleaned): "${cleanOrg}"`);
    log("INFO", `Project (cleaned): "${cleanProject}"`);
    
    // Validate inputs
    if (!cleanOrg) {
      log("ERROR", "Organization is empty or missing");
      return { success: false, message: "Organization is required" };
    }
    if (!cleanProject) {
      log("ERROR", "Project is empty or missing");
      return { success: false, message: "Project is required" };
    }
    if (!cleanToken) {
      log("ERROR", "Token is empty or missing");
      return { success: false, message: "Personal Access Token is required" };
    }

    // Try multiple URL formats - some orgs use different patterns
    // Use encodeURIComponent like git-track does, and API version 7.1
    const urlsToTry = [
      // Standard dev.azure.com format (with URL encoding)
      `https://dev.azure.com/${encodeURIComponent(cleanOrg)}/_apis/projects/${encodeURIComponent(cleanProject)}?api-version=7.1`,
      // Legacy visualstudio.com format
      `https://${encodeURIComponent(cleanOrg)}.visualstudio.com/_apis/projects/${encodeURIComponent(cleanProject)}?api-version=7.1`,
    ];

    let lastError: Error | null = null;
    
    for (const url of urlsToTry) {
      try {
        log("INFO", `Trying URL: ${url}`);
        const result = await adoFetch<unknown>(url, cleanToken);
        log("INFO", "Connection test PASSED");
        log("DEBUG", "Project info retrieved:", result);
        
        return { success: true, message: `Connection successful!\nUsing: ${url.split("/_apis")[0]}` };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        log("WARN", `URL failed: ${url} - ${lastError.message}`);
        
        // If it's an auth error (401/403) or HTML response, don't try other URLs
        if (lastError.message.includes("401") || 
            lastError.message.includes("403") ||
            lastError.message.includes("login page") ||
            lastError.message.includes("invalid JSON")) {
          break;
        }
      }
    }

    const errorMessage = lastError?.message || "Connection failed";
    log("ERROR", `Connection test FAILED: ${errorMessage}`);
    
    // Provide helpful hints based on error
    let hint = "";
    if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
      hint = "\n\nHints:\n- Check that your PAT has not expired\n- Ensure PAT has 'Read' scope for Work Items and Project\n- Verify the token was copied correctly (no extra spaces)\n- Make sure the PAT is for the correct organization";
    } else if (errorMessage.includes("login page") || errorMessage.includes("invalid JSON")) {
      hint = "\n\nHints:\n- Your PAT may be invalid or expired\n- ADO is redirecting to a login page\n- Try generating a new PAT token";
    } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      hint = "\n\nHints:\n- Verify the organization name matches your ADO URL exactly\n- Verify the project name is correct (case-sensitive)\n- Your ADO URL format: dev.azure.com/{org} or {org}.visualstudio.com\n- Check that you have access to this project";
    } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
      hint = "\n\nHints:\n- Your PAT may not have sufficient permissions\n- Required scopes: Work Items (Read), Project and Team (Read)";
    } else if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo") || errorMessage.includes("fetch failed")) {
      hint = "\n\nHints:\n- Check your internet connection\n- Verify the organization name is spelled correctly";
    }
    
    return {
      success: false,
      message: errorMessage + hint,
    };
  });

// Types for ADO API responses
type WiqlResponse = {
  workItems: Array<{ id: number; url: string }>;
};

type WorkItemBatchResponse = {
  value: Array<{
    id: number;
    fields: { "System.Title": string; "System.State": string };
    _links: { html: { href: string } };
  }>;
};

// Search work items using WIQL
export const searchWorkItems = os
  .input(searchWorkItemsInputSchema)
  .handler(async ({ input }) => {
    const { query, organization, project, token } = input;

    log("INFO", "=== Searching Work Items ===");
    log("INFO", `Search query: "${query}"`);
    log("INFO", `Organization (raw): ${organization}, Project (raw): ${project}`);

    // Clean inputs - same cleaning as testConnection
    const cleanOrg = organization.trim()
      .replace(/^https?:\/\//, "")
      .replace(/^dev\.azure\.com\//, "")
      .replace(/\.visualstudio\.com.*$/, "")
      .replace(/\/$/, "")
      .split("/")[0];
    
    const cleanProject = project.trim().replace(/\/$/, "");
    const cleanToken = token.trim();
    const escapedQuery = query.replace(/'/g, "''");
    
    log("INFO", `Organization (cleaned): ${cleanOrg}, Project (cleaned): ${cleanProject}`);

    try {
      // Use WIQL to search for work items (with URL encoding like git-track)
      const wiqlUrl = `https://dev.azure.com/${encodeURIComponent(cleanOrg)}/${encodeURIComponent(cleanProject)}/_apis/wit/wiql?api-version=7.1`;
      const wiqlQuery = {
        query: `SELECT [System.Id], [System.Title], [System.State] 
                FROM WorkItems 
                WHERE [System.TeamProject] = @project 
                AND [System.Title] CONTAINS '${escapedQuery}'
                ORDER BY [System.ChangedDate] DESC`,
      };

      log("DEBUG", "WIQL Query:", wiqlQuery);

      const wiqlResult = await adoFetch<WiqlResponse>(wiqlUrl, cleanToken, "POST", wiqlQuery);

      log("INFO", `WIQL returned ${wiqlResult.workItems?.length || 0} work items`);

      if (!wiqlResult.workItems || wiqlResult.workItems.length === 0) {
        log("INFO", "No work items found matching query");
        return { workItems: [] };
      }

      // Get details for the first 10 work items
      const ids = wiqlResult.workItems.slice(0, 10).map((wi) => wi.id);
      log("DEBUG", `Fetching details for work item IDs: ${ids.join(", ")}`);
      
      // Use workitemsbatch endpoint like git-track
      const detailsUrl = `https://dev.azure.com/${encodeURIComponent(cleanOrg)}/_apis/wit/workitemsbatch?api-version=7.1`;

      const detailsResult = await adoFetch<WorkItemBatchResponse>(detailsUrl, cleanToken, "POST", {
        ids,
        fields: ["System.Id", "System.Title", "System.State"],
      });

      const workItems =
        detailsResult.value?.map((wi) => ({
          id: wi.id,
          title: wi.fields["System.Title"],
          state: wi.fields["System.State"],
          url: `https://dev.azure.com/${encodeURIComponent(cleanOrg)}/${encodeURIComponent(cleanProject)}/_workitems/edit/${wi.id}`,
        })) || [];

      log("INFO", `Returning ${workItems.length} work items with details`);
      return { workItems };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Search failed";
      log("ERROR", `Search failed: ${errorMessage}`);
      return {
        workItems: [],
        error: errorMessage,
      };
    }
  });

// Type for single work item response
type WorkItemResponse = {
  id: number;
  fields: { "System.Title": string; "System.State": string };
  _links: { html: { href: string } };
};

// Get a single work item by ID
export const getWorkItem = os
  .input(getWorkItemInputSchema)
  .handler(async ({ input }) => {
    const { id, organization, project, token } = input;

    log("INFO", "=== Getting Work Item by ID ===");
    log("INFO", `Work Item ID: ${id}`);
    log("INFO", `Organization (raw): ${organization}, Project (raw): ${project}`);

    // Clean inputs - same cleaning as testConnection
    const cleanOrg = organization.trim()
      .replace(/^https?:\/\//, "")
      .replace(/^dev\.azure\.com\//, "")
      .replace(/\.visualstudio\.com.*$/, "")
      .replace(/\/$/, "")
      .split("/")[0];
    
    const cleanProject = project.trim().replace(/\/$/, "");
    const cleanToken = token.trim();
    
    log("INFO", `Organization (cleaned): ${cleanOrg}, Project (cleaned): ${cleanProject}`);

    try {
      // Use URL encoding like git-track
      const url = `https://dev.azure.com/${encodeURIComponent(cleanOrg)}/_apis/wit/workitems/${id}?api-version=7.1`;
      const result = await adoFetch<WorkItemResponse>(url, cleanToken);

      log("INFO", `Successfully retrieved work item: ${result.fields["System.Title"]}`);

      return {
        success: true,
        workItem: {
          id: result.id,
          title: result.fields["System.Title"],
          state: result.fields["System.State"],
          url: result._links?.html?.href || `https://dev.azure.com/${encodeURIComponent(cleanOrg)}/${encodeURIComponent(cleanProject)}/_workitems/edit/${id}`,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get work item";
      log("ERROR", `Failed to get work item ${id}: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
