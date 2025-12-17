/**
 * Validates the format of an uploaded file.
 * @param fileType The MIME type of the file.
 * @returns {string | null} An error message if invalid, otherwise null.
 */
export function validateFileFormat(fileType: string): string | null {
  const allowedFormats = ['image/jpeg', 'image/png'];
  if (!allowedFormats.includes(fileType)) {
    return 'Only JPG, JPEG, and PNG files are allowed';
  }
  return null;
}

/**
 * Validates the size of an uploaded file.
 * @param fileSize The size of the file in bytes.
 * @returns {string | null} An error message if invalid, otherwise null.
 */
export function validateFileSize(fileSize: number): string | null {
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return 'Each file must be under 5MB';
  }
  return null;
}

/**
 * Validates the number of uploaded files.
 * @param fileCount The number of files.
 * @returns {string | null} An error message if invalid, otherwise null.
 */
export function validateFileCount(fileCount: number): string | null {
  const MIN_FILE_COUNT = 1;
  const MAX_FILE_COUNT = 10;

  if (fileCount < MIN_FILE_COUNT) {
    return 'Please upload at least one image';
  }
  if (fileCount > MAX_FILE_COUNT) {
    return 'Maximum 10 files allowed';
  }
  return null;
}
