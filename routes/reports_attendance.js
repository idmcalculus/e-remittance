import { Router } from 'express';
import { getAttendance, getAttendanceById, createAttendance } from '../controllers/reports_attendance.js';

var router = Router();

router.post('/', createAttendance);
router.get('/', getAttendance);
router.get('/:id', getAttendanceById);

export default router;