import { Router } from "express";
import { 
	createSettings,
	getSettings,
	remittanceStatus,
	csrStatus,
	scanStatus
} from "../controllers/admin_settings.js";

const router = Router();

router.post('/', createSettings);
router.get('/', getSettings);
router.get('/remittance', remittanceStatus);
router.get('/csr', csrStatus);
router.get('/scan', scanStatus);

export default router;