'use strict';

if (!process.env.FIREBASE_DB_URL) {
  throw new Error("FIREBASE_DB_URL environment variable is not defined.");
}

if (!process.env.FIREBASE_CREDENTIAL_FILE) {
  throw new Error("FIREBASE_CREDENTIAL_FILE environment variable is not defined.");
}

const firebase = require("firebase-admin");
const serviceAccount = require("../" + process.env.FIREBASE_CREDENTIAL_FILE);

// Singletons so that we don't have to reinitilize this each time
let firebaseApp = null;
let firebaseDb = null;

/**
 * This class uploads summary information from the ITS student model
 * to the Learn Portal for display in the teacher dashboard
 */
class DashboardService {
    constructor() {
        if (firebaseApp == null) {
            console.log("Initialize connection to Firebase");
            let learnPortalCredential = firebase.credential.cert(serviceAccount);
            firebaseApp = firebase.initializeApp({
                credential: learnPortalCredential,
                databaseURL: process.env.FIREBASE_DB_URL
            }, "Dashboard");
        }

        if (firebaseApp != null && firebaseDb == null) {
            firebaseDb = firebase.database(firebaseApp);
        }
    }

    updateStudentDataAsync(session, studentModel, pathToUserITSData) {

      let data = null;
      try {
          data = {
              "studentModel": {
                "concepts": studentModel.bktConceptStates.toObject()
              }
            };

          console.log("Push this to dashboard:\n" + JSON.stringify(data, null, 2));

          console.log("Save student model in Geniventure dashboard db; path=" + pathToUserITSData);
          // Call this promise instead of returning it to run this in parallel since the Firebase DB
          // is taking 60+ seconds for set to return.
          firebaseDb.ref(pathToUserITSData).set(data)
            .then(() => {
              console.log("Successfully set student data in dashboard db.");
            })
            .catch((err) => {
              session.errorAlert("Unable to set student data in dashboard db: " + err);
            });

          return Promise.resolve();

        } catch(err) {
          console.error("Failed to write this to dashboard:\n"+ JSON.stringify(data, null, 2));
          return Promise.reject(err);
        }
    }
}

module.exports = DashboardService;