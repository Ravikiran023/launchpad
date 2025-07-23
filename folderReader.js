const fs = require("fs");
const path = require("path");

function listSubfolders(folderPath, depth) {
    if (depth === 0) return [];

    let subfolders = [];
    try {
        const entries = fs.readdirSync(folderPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullPath = path.join(folderPath, entry.name);
                const children = listSubfolders(fullPath, depth - 1);
                subfolders.push({
                    name: entry.name,
                    subfolders: children
                });
            }
        }
    } catch (err) {
        console.warn("Error reading:", folderPath, err.message);
    }

    return subfolders;
}

function listTopFolders(baseDir) {
    const result = {
        files: [],
        folders: []
    };

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    entries.forEach((entry) => {
        if (entry.isDirectory()) {
            const folderPath = path.join(baseDir, entry.name);
            const depth = entry.name === "resources" ? 2 : 1;

            const subfolders = listSubfolders(folderPath, depth);
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
const folderStructure = listTopFolders(basePath);
console.log(JSON.stringify(folderStructure, null, 2));
