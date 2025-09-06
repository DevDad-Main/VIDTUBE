import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

//#region Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, "public", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

//#endregion

//#region Multer Image && Video Type Filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];
  const allowedVideoTypes = [
    "video/mp4",
    "video/quicktime",
    "video/mov",
    "video/x-matroska",
  ];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
//#endregion

const test = multer.memoryStorage({});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({
  storage,
  fileFilter: fileFilter,
});
