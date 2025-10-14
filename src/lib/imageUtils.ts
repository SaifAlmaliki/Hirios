/**
 * Image processing utilities for company logo uploads
 */

// Standard logo dimensions for navbar display
export const LOGO_DIMENSIONS = {
  width: 120,
  height: 40,
  maxWidth: 200,
  maxHeight: 60
};

/**
 * Resize and standardize image for logo display
 */
export const processLogoImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      const maxWidth = LOGO_DIMENSIONS.maxWidth;
      const maxHeight = LOGO_DIMENSIONS.maxHeight;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to process image'));
          }
        },
        'image/png',
        0.9
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate uploaded file
 */
export const validateLogoFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size (1MB limit)
  if (file.size > 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 1MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and SVG files are allowed' };
  }

  return { valid: true };
};

/**
 * Generate file path for company logo
 */
export const generateLogoPath = (userId: string, originalFileName: string): string => {
  const timestamp = Date.now();
  const extension = originalFileName.split('.').pop() || 'png';
  return `${userId}/${timestamp}-logo.${extension}`;
};
