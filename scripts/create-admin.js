#!/usr/bin/env node

/**
 * Create Admin User Script
 *
 * This script creates an admin user in Firebase Auth and Firestore.
 * It can be run in two modes:
 * 1. Interactive mode: prompts for user details
 * 2. Environment variable mode: uses INITIAL_ADMIN_* env vars
 *
 * Usage:
 *   node scripts/create-admin.js
 *   node scripts/create-admin.js --env
 */

const readline = require("readline");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

// Firebase Admin SDK
const admin = require("firebase-admin");

// Initialize Firebase Admin
function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Missing Firebase Admin SDK credentials!");
    console.error(
      "Please set the following environment variables in .env.local:"
    );
    console.error("  - FIREBASE_PROJECT_ID");
    console.error("  - FIREBASE_CLIENT_EMAIL");
    console.error("  - FIREBASE_PRIVATE_KEY");
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    projectId,
  });

  console.log("✅ Firebase Admin SDK initialized\n");
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Validate email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate password strength
function isStrongPassword(password) {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  return { valid: true };
}

// Create admin user
async function createAdminUser(email, password, displayName, role) {
  try {
    console.log("\n🔄 Creating admin user...");

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    console.log(`✅ User created in Firebase Auth: ${userRecord.uid}`);

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role,
    });

    console.log(`✅ Admin claims set: role=${role}`);

    // Create user document in Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ User document created in Firestore");

    console.log("\n🎉 Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Email: ${email}`);
    console.log(`Name: ${displayName}`);
    console.log(`Role: ${role}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return userRecord;
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      console.error("❌ Error: Email already exists!");
      console.log("\nTip: If you want to make an existing user admin, use:");
      console.log("  node scripts/make-admin.js <email>");
    } else {
      console.error("❌ Error creating admin user:", error.message);
    }
    throw error;
  }
}

// Interactive mode
async function interactiveMode() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   YOB Admin User Creation Wizard");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get email
  let email;
  while (true) {
    email = await question("Admin Email: ");
    if (isValidEmail(email)) {
      break;
    }
    console.log("❌ Invalid email format. Please try again.\n");
  }

  // Get password
  let password;
  while (true) {
    password = await question(
      "Password (min 8 chars, with uppercase, lowercase, number): "
    );
    const validation = isStrongPassword(password);
    if (validation.valid) {
      break;
    }
    console.log(`❌ ${validation.message}\n`);
  }

  // Get display name
  const displayName = (await question("Display Name: ")) || "Admin User";

  // Get role
  console.log("\nSelect role:");
  console.log("  1. super_admin (full access)");
  console.log("  2. admin (standard admin)");
  console.log("  3. moderator (limited access)");

  let role;
  while (true) {
    const choice = (await question("Choice (1-3) [default: 2]: ")) || "2";
    if (choice === "1") {
      role = "super_admin";
      break;
    } else if (choice === "2") {
      role = "admin";
      break;
    } else if (choice === "3") {
      role = "moderator";
      break;
    }
    console.log("❌ Invalid choice. Please select 1, 2, or 3.\n");
  }

  // Confirmation
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Please confirm:");
  console.log(`  Email: ${email}`);
  console.log(`  Name: ${displayName}`);
  console.log(`  Role: ${role}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const confirm = await question("\nCreate this admin user? (yes/no): ");

  if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
    console.log("\n❌ Cancelled by user");
    return null;
  }

  return await createAdminUser(email, password, displayName, role);
}

// Environment variable mode
async function envMode() {
  console.log("🔄 Creating admin user from environment variables...\n");

  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const displayName = process.env.INITIAL_ADMIN_NAME || "Admin User";
  const role = process.env.INITIAL_ADMIN_ROLE || "super_admin";

  if (!email || !password) {
    console.error("❌ Missing required environment variables!");
    console.error("Please set:");
    console.error("  - INITIAL_ADMIN_EMAIL");
    console.error("  - INITIAL_ADMIN_PASSWORD");
    console.error("  - INITIAL_ADMIN_NAME (optional)");
    console.error("  - INITIAL_ADMIN_ROLE (optional, default: super_admin)");
    process.exit(1);
  }

  if (!isValidEmail(email)) {
    console.error("❌ Invalid email format");
    process.exit(1);
  }

  const passwordValidation = isStrongPassword(password);
  if (!passwordValidation.valid) {
    console.error(`❌ ${passwordValidation.message}`);
    process.exit(1);
  }

  return await createAdminUser(email, password, displayName, role);
}

// Main function
async function main() {
  try {
    initFirebase();

    const useEnv = process.argv.includes("--env");

    if (useEnv) {
      await envMode();
    } else {
      await interactiveMode();
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Script failed:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run
main();
