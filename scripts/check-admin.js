#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });
const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }),
  projectId,
});

async function checkUser() {
  const email = "admin@yaponarbirak.com";
  
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log("User Record:", {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      customClaims: userRecord.customClaims
    });
    
    const userDoc = await admin.firestore().collection("users").doc(userRecord.uid).get();
    console.log("\nFirestore Document:", userDoc.data());
    
  } catch (error) {
    console.error("Error:", error.message);
  }
  
  process.exit(0);
}

checkUser();
