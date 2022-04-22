import { Router } from 'express';
import { 
	getAttendance,
	createAttendance,
	updateAttendance,
	deleteAttendance
} from '../controllers/reports_attendance.js';

var router = Router();

router.post('/', createAttendance);
router.get('/', getAttendance);
router.put('/', updateAttendance);
router.delete('/', deleteAttendance);

export default router;