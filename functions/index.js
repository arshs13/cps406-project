/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyStatusChange = onDocumentUpdated("Reports/{reportId}",
    async (event) => {
        const beforeData = event.data.before.data();
        const afterData = event.data.after.data();

        const targetStatuses = ["In-Progress", "Resolved", "Rejected"];

        if (beforeData.status === afterData.status ||
            !targetStatuses.includes(afterData.status)) {
            return;
        }

        const subscribers = afterData.subscribers || [];
        if (subscribers.length === 0) return;

        const db = admin.firestore();
        const batch = db.batch();

        subscribers.forEach(userId => {
            const notificationRef = db.collection("Notifications").doc();
            batch.set(notificationRef, {
                userId: userId,
                reportId: event.params.reportId,
                message: `Report "${afterData.title}" status changed to ${afterData.status}`,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        return batch.commit()
            .then(() => logger.log("Notifications created successfully"))
            .catch(error => logger.error("Error creating notifications:", error));
    });
