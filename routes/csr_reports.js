import { Router } from 'express';
import { 
	getCsrReport,
	createCsrReport,
	deleteCsrReport
} from '../controllers/csr_reports.js';
import { csrLocked } from '../middlewares/admin_settings.js';

const router = Router();

router.post('/', csrLocked, createCsrReport);
router.get('/', getCsrReport);
router.delete('/', deleteCsrReport);

export default router;