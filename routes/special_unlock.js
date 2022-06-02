import Router from 'express';
import { insertSpecialUnlockData, getSpecialUnlockData } from '../controllers/special_unlock.js';

const router = Router();

router.post('/', insertSpecialUnlockData);
router.get('/', getSpecialUnlockData);

export default router;