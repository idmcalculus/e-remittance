import { Router } from 'express';
import { 
	getCsrReport,
	getCsrReportById,
	getCsrReportByParishCode,
	getCsrReportByAreaCode,
	getCsrReportByZoneCode,
	getCsrReportByProvinceCode,
	getCsrReportByRegionCode,
	createCsrReport
} from '../controllers/csr_reports.js';

let router = Router();

router.post('/', createCsrReport);
router.get('/', getCsrReport);
router.get('/:id', getCsrReportById);
router.get('/parish/:parish_code', getCsrReportByParishCode);
router.get('/area/:area_code', getCsrReportByAreaCode);
router.get('/zone/:zone_code', getCsrReportByZoneCode);
router.get('/province/:province_code', getCsrReportByProvinceCode);
router.get('/region/:region_code', getCsrReportByRegionCode);

export default router;