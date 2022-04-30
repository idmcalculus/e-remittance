import { Router } from "express";
import multer, { diskStorage } from 'multer';
import { fileUpload } from "../controllers/csr_images.js";

let router = Router();

let storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})
 
let upload = multer({ storage: storage }).single('recordsupload');

router.post("/", upload, fileUpload);

export default router;