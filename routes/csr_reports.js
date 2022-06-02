import { Router } from 'express';
import { 
	getCsrReport,
	createCsrReport,
	updateCsrReport,
	deleteCsrReport,
	getMonthlyReport,
	getMonthlyReportByCategory,
	getParishCsrReport
} from '../controllers/csr_reports.js';
import { csrLocked } from '../middlewares/admin_settings.js';

const router = Router();

router.post('/', csrLocked, createCsrReport);
router.get('/', getCsrReport);
router.get('/monthly_report', getMonthlyReport);
router.get('/monthly_cat_report', getMonthlyReportByCategory);
router.get('/parish_report', getParishCsrReport);
router.put('/:id', csrLocked, updateCsrReport);
router.delete('/', deleteCsrReport);

export default router;