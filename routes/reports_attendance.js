import { Router } from 'express';
import { 
	getAttendance,
	/* getAttendanceById,
	getAttendanceByParishCode,
	getAttendanceByAreaCode,
	getAttendanceByZoneCode,
	getAttendanceByProvinceCode,
	getAttendanceByRegionCode,
	getAttendanceByServiceDate, */
	createAttendance 
} from '../controllers/reports_attendance.js';

var router = Router();

router.post('/', createAttendance);
router.get('/', getAttendance);
/* router.get('/:id', getAttendanceById);
router.get('/parish/:parish_code', getAttendanceByParishCode);
router.get('/area/:area_code', getAttendanceByAreaCode);
router.get('/zone/:zone_code', getAttendanceByZoneCode);
router.get('/province/:province_code', getAttendanceByProvinceCode);
router.get('/region/:region_code', getAttendanceByRegionCode);
router.get('/date/:service_date', getAttendanceByServiceDate); */

export default router;