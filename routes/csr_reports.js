import { Router } from 'express';
import { 
	getCsrReport,
	createCsrReport,
	updateCsrReport,
	deleteCsrReport
} from '../controllers/csr_reports.js';

let router = Router();

router.post('/', createCsrReport);
router.get('/', getCsrReport);
router.put('/', updateCsrReport);
router.delete('/', deleteCsrReport);

export default router;