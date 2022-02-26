import { Router } from 'express';
import { getCsrReport, getCsrReportById, createCsrReport } from '../controllers/csr_reports.js';

let router = Router();

router.post('/', createCsrReport);
router.get('/', getCsrReport);
router.get('/:id', getCsrReportById);

export default router;