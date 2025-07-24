const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const { execFileSync } = require("child_process");

// Paths
const distPath = path.resolve(__dirname, "dist");
const tempPath = path.resolve(__dirname, "temp_zip_build");
const nestedDistPath = path.join(tempPath, "resources", "dist");
const zipFileName = "commelodysuitelaunchpad.zip";
const zipDestination = path.resolve(__dirname, zipFileName);

// Cleanup temp folder if exists
if (fs.existsSync(tempPath)) {
    fse.removeSync(tempPath);
}

// Step 1: Copy ./dist → temp root
fse.copySync(distPath, tempPath);

// Step 2: Create resources/dist inside temp and copy ./dist again
fse.ensureDirSync(nestedDistPath);
fse.copySync(distPath, nestedDistPath);

// Step 3: Run npm-build-zip CLI to create zip from temp
try {
    execFileSync(
        path.resolve(__dirname, "node_modules", ".bin", "npm-build-zip"),
        [
            "--source", tempPath,
            "--destination", zipDestination
        ],
        { stdio: "inherit" }
    );

    console.log(`✅ ZIP created: ${zipFileName}`);

    // Optional cleanup
    fse.removeSync(tempPath);
} catch (error) {
    console.error("❌ ZIP creation failed:", error.message);
}
