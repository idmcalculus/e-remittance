import { Router } from 'express';
import { 
	getCsrReport,
	createCsrReport,
	deleteCsrReport,
	getMonthlyReport
} from '../controllers/csr_reports.js';
import { csrLocked } from '../middlewares/admin_settings.js';

const router = Router();

router.post('/', csrLocked, createCsrReport);
router.get('/', getCsrReport);
router.get('/monthly_report', getMonthlyReport);
router.delete('/', deleteCsrReport);

export default router;