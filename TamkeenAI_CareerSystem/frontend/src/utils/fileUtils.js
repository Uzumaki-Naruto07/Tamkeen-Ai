import { FILE_SIZE_LIMITS, FILE_TYPES } from './constants';

// File type validation
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.some((type) => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type === type;
  });
};

// File size validation
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// File name sanitization
export const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// File extension extraction
export const getFileExtension = (fileName) => {
  return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 1).toLowerCase();
};

// File name without extension
export const getFileNameWithoutExtension = (fileName) => {
  return fileName.slice(0, (fileName.lastIndexOf('.') - 1 >>> 0) + 1);
};

// File size formatting
export const formatFileSize = (bytes, options = {}) => {
  const {
    locale = 'en-US',
    decimals = 2,
  } = options;
  
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

// File upload with progress
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(progress);
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error('File upload failed');
  }
};

// Multiple file upload
export const uploadMultipleFiles = async (files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await fetch('/api/upload/multiple', {
      method: 'POST',
      body: formData,
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(progress);
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Multiple file upload failed');
  }
};

// File download
export const downloadFile = async (fileUrl, fileName) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('File download failed');
  }
};

// File preview
export const getFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File preview failed'));
    reader.readAsDataURL(file);
  });
};

// File validation
export const validateFile = (file, rules) => {
  const errors = [];
  
  rules.forEach((rule) => {
    if (rule.required && !file) {
      errors.push('File is required');
    } else if (rule.types && !validateFileType(file, rule.types)) {
      errors.push(`File must be of type ${rule.types.join(', ')}`);
    } else if (rule.maxSize && !validateFileSize(file, rule.maxSize)) {
      errors.push(`File size must be at most ${formatFileSize(rule.maxSize)}`);
    } else if (rule.validate) {
      const error = rule.validate(file);
      if (error) {
        errors.push(error);
      }
    }
  });
  
  return errors;
};

// File compression
export const compressFile = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              }));
            } else {
              reject(new Error('Compression failed'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
};

// File type detection
export const detectFileType = (file) => {
  const signatures = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'application/msword': [0xD0, 0xCF, 0x11, 0xE0],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      0x50,
      0x4B,
      0x03,
      0x04,
    ],
  };
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      let result = null;
      
      for (const [type, signature] of Object.entries(signatures)) {
        if (signature.every((byte, index) => byte === arr[index])) {
          result = type;
          break;
        }
      }
      
      resolve(result);
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

// File metadata extraction
export const extractFileMetadata = (file) => {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    extension: getFileExtension(file.name),
  };
};

// File reading
export const readFile = (file, options = {}) => {
  const {
    asText = false,
    asArrayBuffer = false,
    asDataURL = false,
  } = options;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    
    if (asText) {
      reader.readAsText(file);
    } else if (asArrayBuffer) {
      reader.readAsArrayBuffer(file);
    } else if (asDataURL) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
};

// File manipulation
export const manipulateFile = (file, operations) => {
  let result = file;
  
  operations.forEach((operation) => {
    switch (operation.type) {
      case 'compress':
        result = compressFile(result, operation.options);
        break;
      case 'rename':
        result = new File([result], operation.name, {
          type: result.type,
          lastModified: result.lastModified,
        });
        break;
      case 'sanitize':
        result = new File([result], sanitizeFileName(result.name), {
          type: result.type,
          lastModified: result.lastModified,
        });
        break;
      default:
        break;
    }
  });
  
  return result;
};

// Export file utilities
export default {
  validateFileType,
  validateFileSize,
  sanitizeFileName,
  getFileExtension,
  getFileNameWithoutExtension,
  formatFileSize,
  detectFileType,
  readFile,
  downloadFile,
  uploadFile,
  compressFile,
  validateFile,
  manipulateFile,
}; 