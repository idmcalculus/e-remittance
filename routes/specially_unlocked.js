import Router from 'express';
import { unlockChurch, getUnlockedChurches } from '../controllers/specially_unlocked.js';

const router = Router();

router.post('/', unlockChurch);
router.get('/', getUnlockedChurches);

export default router;