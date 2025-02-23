import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs'; // Add this import at the top

dotenv.config();

let db;
export async function connectDB() {
    if (!db) {
        try {
            // Determine the path based on the environment
            const serviceAccountPath = process.env.NODE_ENV === 'production'
                ? '/etc/secrets/serviceAccountKey.json'
                : './config/serviceAccountKey.json';

            // Initialize Firestore
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath)
            });

            db = admin.firestore(); // Create a Firestore instance
            console.log("Connected to Firestore database");
        } catch (error) {
            console.error("Error connecting to Firestore:", error.message);
            process.exit(1); // Exit the process on failure
        }
    }
    return db; // Return the existing Firestore instance
}

