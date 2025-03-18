const multer = require("multer");
const { adminStorage } = require("../config/firebase");

// Set up multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Initialize multer with memory storage

// Function to handle multiple image uploads to Firebase Storage
const uploadImages = async (files) => {
  try {
    const bucket = adminStorage.bucket();
    const uploadPromises = files.map(async (file) => {
      const filePath = `prop-cid/${Date.now()}_${file.originalname}`; // Custom path in Firebase Storage
      const firebaseFile = bucket.file(filePath);

      const blobStream = firebaseFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on("error", (error) => {
          reject(error);
        });

        blobStream.on("finish", async () => {
          const [url] = await firebaseFile.getSignedUrl({
            action: "read",
            expires: "03-09-2491", // Validity of the signed URL
            queryParams: { alt: "media" },
          });
          resolve(url); // Return the signed URL for the image
        });

        blobStream.end(file.buffer); // Upload the file buffer to Firebase
      });
    });

    const imageUrls = await Promise.all(uploadPromises); // Wait for all uploads to complete
    return imageUrls; // Return an array of signed URLs
  } catch (error) {
    throw new Error("Error uploading images: " + error.message);
  }
};

module.exports = {
  uploadImages,
  upload, // Export the upload middleware
};