/**
 * Cloudinary Configuration with Lazy Loading
 * Improves cold start performance by loading cloudinary only when needed
 */

let cloudinaryInstance: any = null;

async function getCloudinaryInstance() {
  if (!cloudinaryInstance) {
    const { v2: cloudinary } = await import('cloudinary');
    
    // Configure cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
      secure: true,
    });

    cloudinaryInstance = cloudinary;
  }
  
  return cloudinaryInstance;
}

// Export getter function for lazy loading
export const getCloudinary = getCloudinaryInstance;

// Default export for backward compatibility
export default {
  get uploader() {
    if (!cloudinaryInstance) {
      throw new Error('Cloudinary not initialized. Use getCloudinary() for async initialization.');
    }
    return cloudinaryInstance.uploader;
  }
};
