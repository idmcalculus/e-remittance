import { Router } from 'express';
import { getServices, createServices, deleteServices, getParishServices } from '../controllers/services.js';

const router = Router();

router.post('/', createServices);
router.get('/', getServices);
router.get('/parish', getParishServices);
router.delete('/', deleteServices);

export default router;