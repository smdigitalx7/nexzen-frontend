#!/usr/bin/env node

/**
 * Verification script to check if environment variables are loaded correctly
 * Run this before building to verify .env.production is set up correctly
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checkEnvFile = () => {
  console.log("🔍 Verifying Environment Configuration\n");
  console.log("=".repeat(50));

  // Check if .env.production exists in root
  const envFile = join(__dirname, ".env.production");

  if (!existsSync(envFile)) {
    console.log("❌ ERROR: .env.production not found in project root!");
    console.log(`   Expected location: ${envFile}`);
    console.log("\n💡 Solution:");
    console.log("   1. Copy your brand-specific env file to .env.production");
    console.log("   2. For Akshara: cp env.akshara.production .env.production");
    console.log("   3. For Velonex: cp env.velonex.production .env.production");
    process.exit(1);
  }

  console.log("✅ .env.production found in project root");

  // Read and check content
  const envContent = readFileSync(envFile, "utf-8");

  // Check for required variables
  const requiredVars = [
    "VITE_LOGO_SCHOOL",
    "VITE_LOGO_COLLEGE",
    "VITE_LOGO_BRAND",
    "VITE_BG_LOGIN",
    "VITE_BRAND_NAME",
  ];

  const missingVars = [];
  const foundVars = [];

  requiredVars.forEach((varName) => {
    if (envContent.includes(varName)) {
      const match = envContent.match(new RegExp(`${varName}=(.+)`));
      if (match && match[1]) {
        const value = match[1].trim();
        foundVars.push({ name: varName, value });
        console.log(`✅ ${varName} = ${value}`);
      } else {
        missingVars.push(varName);
        console.log(`⚠️  ${varName} is set but empty`);
      }
    } else {
      missingVars.push(varName);
      console.log(`❌ ${varName} not found`);
    }
  });

  console.log("\n" + "=".repeat(50));

  if (missingVars.length > 0) {
    console.log(`\n❌ Missing ${missingVars.length} required variable(s):`);
    missingVars.forEach((v) => console.log(`   - ${v}`));
    console.log("\n💡 Solution: Check your .env.production file");
    process.exit(1);
  }

  // Detect brand name from environment
  const brandName =
    foundVars.find((v) => v.name === "VITE_BRAND_NAME")?.value || "Unknown";
  console.log(`\n✅ Brand configuration detected: ${brandName}`);

  // Check if assets exist
  console.log("\n📦 Checking Assets...");
  const assetsDir = join(__dirname, "client", "public", "assets");

  // Determine required assets based on brand
  let requiredAssets = [];
  if (brandName.toLowerCase() === "akshara") {
    requiredAssets = [
      "Akshara-logo.png",
      "Akshara-headname.png",
      "Akshara-loginbg.jpg",
    ];
  } else if (brandName.toLowerCase() === "velonex") {
    // Velonex uses different asset names based on env file
    // Check for assets referenced in env.velonex.production
    requiredAssets = [
      "nexzen-logo.png",
      "Velocity-logo.png",
      "Velonex-headname1.png",
      "institiute-bgg.jpg",
    ];
  } else {
    // Generic check - try to extract asset names from env variables
    const logoSchoolMatch = envContent.match(/VITE_LOGO_SCHOOL=(.+)/);
    const logoBrandMatch = envContent.match(/VITE_LOGO_BRAND=(.+)/);
    const bgLoginMatch = envContent.match(/VITE_BG_LOGIN=(.+)/);

    if (logoSchoolMatch) {
      const asset = logoSchoolMatch[1].replace("/assets/", "").trim();
      if (asset) requiredAssets.push(asset);
    }
    if (logoBrandMatch) {
      const asset = logoBrandMatch[1].replace("/assets/", "").trim();
      if (asset) requiredAssets.push(asset);
    }
    if (bgLoginMatch) {
      const asset = bgLoginMatch[1].replace("/assets/", "").trim();
      if (asset) requiredAssets.push(asset);
    }
  }

  let assetsFound = 0;
  requiredAssets.forEach((asset) => {
    const assetPath = join(assetsDir, asset);
    if (existsSync(assetPath)) {
      console.log(`✅ ${asset}`);
      assetsFound++;
    } else {
      console.log(`❌ ${asset} - NOT FOUND`);
      console.log(`   Expected: ${assetPath}`);
    }
  });

  console.log("\n" + "=".repeat(50));

  if (assetsFound < requiredAssets.length) {
    console.log(
      `\n⚠️  Warning: Only ${assetsFound} of ${requiredAssets.length} assets found`
    );
    if (brandName.toLowerCase() === "akshara") {
      console.log('💡 Solution: Run "npm run setup:akshara" to copy assets');
    } else if (brandName.toLowerCase() === "velonex") {
      console.log(
        "💡 Solution: Ensure Velonex assets are in client/public/assets/"
      );
    } else {
      console.log(
        `💡 Solution: Ensure ${brandName} assets are in client/public/assets/`
      );
    }
  } else {
    console.log(`\n✅ All ${assetsFound} assets found`);
  }

  // Final summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(
    `   Environment Variables: ${foundVars.length}/${requiredVars.length} ✅`
  );
  console.log(
    `   Assets: ${assetsFound}/${requiredAssets.length} ${assetsFound === requiredAssets.length ? "✅" : "⚠️"}`
  );

  if (
    foundVars.length === requiredVars.length &&
    assetsFound === requiredAssets.length
  ) {
    console.log("\n🎉 Everything is ready for build!");
    console.log("   Run: npm run build");
  } else {
    console.log("\n⚠️  Please fix the issues above before building");
    process.exit(1);
  }
};

checkEnvFile();
