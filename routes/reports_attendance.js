import { Router } from 'express';
import { 
	getAttendance,
	createAttendance,
	deleteAttendance,
	getMonthlyAttendance,
	getParishAttendance,
	getMonthlyAttByChurchHierarchy,
	getMonthlyProgressReport
} from '../controllers/reports_attendance.js';
import { sourceDocUpload } from '../middlewares/multer.js';
import { fileUpload, getSourceDocs } from '../controllers/source_doc.js';
import { remittanceLocked, scanLocked } from '../middlewares/admin_settings.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Reports Attendance
 *     description: |
 *       For attendance in Church services in parishes, areas, zones, provinces or regions
 */

router.post('/', remittanceLocked, createAttendance);
router.post('/source_doc', sourceDocUpload, scanLocked, fileUpload);
router.get('/', getAttendance);
router.get('/parish_att', getParishAttendance);
router.get('/monthly_report', getMonthlyAttendance);
router.get('/monthly_report/hierarchy', getMonthlyAttByChurchHierarchy);
router.get('/monthly_report/progress', getMonthlyProgressReport);
router.get('/source_doc', getSourceDocs);
router.delete('/', deleteAttendance);

export default router;