const express = require("express");
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getLatestProperties,
} = require("../services/propertyServices");
const { successResponse, errorResponse } = require("../utils/responseManager");
const { uploadImages, upload } = require("../controllers/imageController"); // Import upload middleware

const router = express.Router();

// Create a new property with multiple images
router.post("/newProperty", upload.array("images", 10), async (req, res) => {
  try {
    const propertyData = req.body;

    // If images are uploaded, handle the file upload via uploadImages
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadImages(req.files); // Upload multiple images
      propertyData.images = imageUrls; // Add the image URLs to propertyData
    }

    const newProperty = await createProperty(propertyData);
    successResponse(res, newProperty, "Property created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating property");
  }
});

// Get all properties
router.get("/getProperties", async (req, res) => {
  try {
    const properties = await getProperties();
    successResponse(res, properties, "Properties fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching properties");
  }
});

// Get latest properties
router.get("/getLatestProperties", async (req, res) => {
  try {
    const latestProperties = await getLatestProperties();
    successResponse(res, latestProperties, "Latest properties fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching latest properties");
  }
});

// Get a single property by ID
router.get("/getPropertyById/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await getPropertyById(propertyId);
    successResponse(res, property, "Property fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Property not found", 404);
  }
});

// Update property data with multiple images
router.put("/updateProperty/:id", upload.array("images", 10), async (req, res) => {
  try {
    const propertyId = req.params.id;
    const propertyData = req.body;

    // If new images are uploaded, handle the file upload via uploadImages
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadImages(req.files); // Upload multiple images
      propertyData.images = imageUrls; // Add the image URLs to propertyData
    }

    const updatedProperty = await updateProperty(propertyId, propertyData);
    successResponse(res, updatedProperty, "Property updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating property");
  }
});

// Delete a property
router.delete("/deleteProperty/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const result = await deleteProperty(propertyId);
    successResponse(res, result, "Property deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting property");
  }
});

module.exports = router;