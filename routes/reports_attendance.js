import { Router } from 'express';
import { 
	getAttendance,
	createAttendance,
	deleteAttendance,
	getMonthlyAttendance
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
router.get('/monthly_report', getMonthlyAttendance);
router.get('/source_doc', getSourceDocs);
router.delete('/', deleteAttendance);

export default router;