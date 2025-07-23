const fs = require("fs");
const path = require("path");

function listTopFoldersAndOneLevel(baseDir) {
    const result = {
        files: [],
        folders: []
    };

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    entries.forEach((entry) => {
        if (entry.isDirectory()) {
            const folderPath = path.join(baseDir, entry.name);
            const subEntries = fs.readdirSync(folderPath, { withFileTypes: true });
            const subfolders = subEntries
                .filter((sub) => sub.isDirectory())
                .map((sub) => sub.name);

            result.folders.push({
                folder: entry.name,
                subfolders: subfolders
            });
        } else {
            result.files.push(entry.name);
        }
    });

    return result;
}

const basePath = __dirname;
const folderStructure = listTopFoldersAndOneLevel(basePath);

console.log(JSON.stringify(folderStructure, null, 2));
