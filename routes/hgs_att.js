import Router from 'express';
import { createHGSReport, getHGSData } from '../controllers/hgs_att.js';

const router = Router();

router.post('/', createHGSReport);
router.get('/', getHGSData);

export default router;