const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

// Uploaded files location
const TMP_FOLDER = path.resolve(__dirname, "..", "tmp");
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, "uploads");

// Verifica se o diretório existe e cria se necessário
if (!fs.existsSync(TMP_FOLDER)) {
    fs.mkdirSync(TMP_FOLDER);
}

if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER);
}

const MULTER = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, UPLOADS_FOLDER); // Armazena os arquivos em UPLOADS_FOLDER
        },
        filename: (req, file, cb) => {
            const fileHash = crypto.randomBytes(10).toString("hex");
            const fileName = `${fileHash}-${file.originalname}`;
            cb(null, fileName);
        },
    }),
};

module.exports = {
    TMP_FOLDER,
    UPLOADS_FOLDER,
    MULTER,
};
