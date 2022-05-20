import { Router } from 'express';
import { getServices, createServices, deleteServices } from '../controllers/services.js';

const router = Router();

router.post('/', createServices);
router.get('/', getServices);
router.delete('/', deleteServices);

export default router;