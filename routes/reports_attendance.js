import { Router } from 'express';
import { 
	getAttendance,
	createAttendance 
} from '../controllers/reports_attendance.js';

var router = Router();

router.post('/', createAttendance);
router.get('/', getAttendance);

export default router;