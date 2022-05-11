import { Router } from "express";
import { csrImageUpload } from "../middlewares/multer.js";
import { fileUpload, getCsrFiles } from "../controllers/csr_images.js";

const router = Router();

function renderFileUploadPage (req, res, next) {
    res.render('files', { 
        title: 'E-remittance App'
    });
}

router.post('/', csrImageUpload, fileUpload);
router.get('/', getCsrFiles);

export default router;