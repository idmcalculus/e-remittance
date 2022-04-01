import { Router } from 'express';
import { 
	getCsrReport,
	createCsrReport
} from '../controllers/csr_reports.js';

let router = Router();

router.post('/', createCsrReport);
router.get('/', getCsrReport);

export default router;