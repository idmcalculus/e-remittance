import { Router } from "express";
import { csrImageUpload } from "../middlewares/multer.js";
import { fileUpload, getCsrFiles } from "../controllers/csr_images.js";
import { csrLocked } from '../middlewares/admin_settings.js';

const router = Router();

router.post('/', csrImageUpload, csrLocked, fileUpload);
router.get('/', getCsrFiles);

export default router;