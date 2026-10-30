/** Stay under Supabase Free global limit (50 MB) when compressing for upload. */
export const SAFE_STORAGE_UPLOAD_BYTES = 45 * 1024 * 1024;

/** App-side selection cap before compression (1 GB). */
export const MAX_VIDEO_BYTES = 1000 * 1024 * 1024;

export const MAX_VIDEO_MB = Math.round(MAX_VIDEO_BYTES / (1024 * 1024));
export const SAFE_STORAGE_UPLOAD_MB = Math.round(SAFE_STORAGE_UPLOAD_BYTES / (1024 * 1024));
