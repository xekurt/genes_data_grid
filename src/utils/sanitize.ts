/**
 * Sanitizes a string to be used as a clean object key.
 * - Trims whitespace
 * - Converts to lowercase
 * - Replaces spaces with underscores
 * - Removes non-alphanumeric characters (except underscores)
 * 
 * @param header The raw header string from the CSV.
 * @returns A sanitized version of the header.
 */
export const sanitizeHeader = (header: string): string => {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')           // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, '');    // Remove special characters
};
