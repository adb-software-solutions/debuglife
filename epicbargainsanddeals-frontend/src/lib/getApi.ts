import { epicbargainsanddeals_api_url, epicbargainsanddeals_server_api_url } from "@/config/appSettings";

export function getBaseUrl() {
    // Check if running on the server
    if (typeof window === "undefined") {
        // Running on server - use Docker container name
        return epicbargainsanddeals_server_api_url;
    } else {
        // Running on client - use specific domain
        return epicbargainsanddeals_api_url;
    }
}

// Function to get the full API URL by appending the API path
export function getApiUrl(apiPath: string): string {
    const baseUrl = getBaseUrl(); // Get the base URL dynamically
    return `${baseUrl}${apiPath}`; // Construct the full API URL
}
