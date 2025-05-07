// src/lib/fetcher.js

/**
 * A simple fetch wrapper for making API requests.
 * Automatically handles JSON parsing and throws errors for non-ok responses.
 *
 * @param {string} url - The URL to fetch.
 * @param {object} [options={}] - Optional fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} - A promise that resolves with the JSON response body.
 * @throws {Error} - Throws an error if the network response is not ok, including status text.
 */
export const fetcher = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json', // Default content type, can be overridden
        ...options.headers, // Allow overriding headers
      },
    });

    // Check if the response status is ok (status code 200-299)
    if (!res.ok) {
      // Try to parse error details from the response body
      let errorData;
      try {
        errorData = await res.json();
      } catch (parseError) {
        // If parsing fails, use the status text
        errorData = { message: res.statusText };
      }

      // Create an error object with status and message
      const error = new Error(errorData?.message || `An error occurred: ${res.statusText}`);
      error.status = res.status; // Attach status code to the error object
      error.info = errorData; // Attach the full error info
      throw error; // Throw the custom error
    }

    // If response is ok, parse the JSON body
    // Handle cases where the response might be empty (e.g., 204 No Content)
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
         // If response has no content, return null or an empty object as appropriate
         if (res.status === 204) {
             return null;
         }
        return await res.json();
    } else {
        // Handle non-JSON responses if necessary, or just return null/undefined
        return null; // Or potentially await res.text() if you expect text
    }


  } catch (error) {
    // Log the error or handle it as needed
    console.error("Fetch error:", error.status, error.message, error.info);
    // Re-throw the error so calling code (like SWR or component logic) can catch it
    throw error;
  }
};

// You can also create specific fetcher functions if needed, e.g., for authenticated requests
// export const authenticatedFetcher = async (url, options = {}) => {
//   // Potentially add Authorization header here if needed directly
//   // (though often handled by cookies automatically for API routes)
//   return fetcher(url, options);
// };