// API Configuration
// This uses the NEXT_PUBLIC_API_URL environment variable
// Falls back to localhost for development

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    signup: `${API_BASE_URL}/api/v1/auth/signup`,
    login: `${API_BASE_URL}/api/v1/auth/login`,
  },
  audio: {
    upload: `${API_BASE_URL}/api/v1/audio/upload`,
    trim: (fileId: string) => `${API_BASE_URL}/api/v1/audio/trim/${fileId}`,
    speed: (fileId: string) => `${API_BASE_URL}/api/v1/audio/speed/${fileId}`,
    download: (fileId: string) =>
      `${API_BASE_URL}/api/v1/audio/download/${fileId}`,
    delete: (fileId: string) => `${API_BASE_URL}/api/v1/audio/delete/${fileId}`,
  },
  video: {
    removeSound: `${API_BASE_URL}/api/v1/video/remove-sound`,
  },
  converter: {
    imageToPdf: `${API_BASE_URL}/api/v1/converter/image-to-pdf`,
    pdfToImage: `${API_BASE_URL}/api/v1/converter/pdf-to-image`,
  },
  socials: {
    info: `${API_BASE_URL}/api/v1/socials/info`,
    download: (type: string) =>
      `${API_BASE_URL}/api/v1/socials/download?type=${type}`,
  },
  musicId: {
    recognize: `${API_BASE_URL}/api/v1/music-id/recognize`,
  },
};
