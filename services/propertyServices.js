const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit } = require('firebase/firestore');

// Create a new property in Firestore with createdOn timestamp
const createProperty = async (propertyData) => {
    try {
        // Fetch all documents to determine the count
        const propertiesSnapshot = await getDocs(collection(db, "properties"));
        const propertyCount = propertiesSnapshot.size + 1; // Next property number

        // Generate property number in the format PROP01, PROP02, etc.
        const propertyNo = `PROP${propertyCount.toString().padStart(2, "0")}`;

        const propertyWithTimestamp = { 
            ...propertyData, 
            propertyNo, // Store property number
            createdOn: Date.now(), 
            updatedOn: Date.now() 
        };

        const docRef = await addDoc(collection(db, "properties"), propertyWithTimestamp);
        
        return { id: docRef.id, ...propertyWithTimestamp };
    } catch (error) {
        throw new Error("Error creating property: " + error.message);
    }
};

// Get all properties from Firestore sorted by createdOn in descending order (newest first)
const getProperties = async () => {
    try {
        const propertiesQuery = query(collection(db, "properties"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(propertiesQuery);
        const properties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return properties;
    } catch (error) {
        throw new Error("Error fetching properties: " + error.message);
    }
};

// Get top 5 properties sorted by createdOn in descending order (newest first)
const getLatestProperties = async () => {
    try {
        const propertiesQuery = query(
            collection(db, "properties"),
            orderBy("createdOn", "desc"),
            limit(5) // Limit the results to 5
        );
        const querySnapshot = await getDocs(propertiesQuery);
        const properties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return properties;
    } catch (error) {
        throw new Error("Error fetching top 5 properties: " + error.message);
    }
};

// Get a single property by ID from Firestore
const getPropertyById = async (propertyId) => {
    try {
        const propertyRef = doc(db, "properties", propertyId);
        const propertyDoc = await getDoc(propertyRef);

        if (!propertyDoc.exists()) {
            throw new Error("Property not found");
        }

        return { id: propertyDoc.id, ...propertyDoc.data() };
    } catch (error) {
        throw new Error("Error fetching property: " + error.message);
    }
};

// Update property data in Firestore
const updateProperty = async (propertyId, propertyData) => {
    try {
        const updatedData = {
            ...propertyData,
            updatedOn: Date.now(), // Ensure updatedOn is always set
        };
        const propertyRef = doc(db, "properties", propertyId);
        await setDoc(propertyRef, updatedData, { merge: true });
        return { id: propertyId, ...updatedData };
    } catch (error) {
        throw new Error("Error updating property: " + error.message);
    }
};


// Delete a property from Firestore
const deleteProperty = async (propertyId) => {
    try {
        const propertyRef = doc(db, "properties", propertyId);
        await deleteDoc(propertyRef);
        return { message: "Property deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting property: " + error.message);
    }
};

module.exports = { createProperty, getProperties, getLatestProperties, getPropertyById, updateProperty, deleteProperty };