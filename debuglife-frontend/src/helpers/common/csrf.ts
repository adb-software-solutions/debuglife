export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export async function fetchWithCSRF(
    input: RequestInfo,
    init?: RequestInit,
): Promise<Response> {
    const csrfToken = getCookie("csrftoken");
    // Determine if this is a state-changing request:
    const method = init?.method ? init.method.toUpperCase() : "GET";
    const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];

    // Create headers object; merge if provided.
    const headers = new Headers(init?.headers);
    if (stateChangingMethods.includes(method)) {
        headers.set("X-CSRFToken", csrfToken || "");
    }

    return fetch(input, {
        ...init,
        headers,
        credentials: "include", // Ensure cookies are sent
    });
}
