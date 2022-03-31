import { Router } from 'express';
import { getServices, getServiceById, createServices } from '../controllers/services.js';

let router = Router();

router.post('/', createServices);
router.get('/', getServices);
router.get('/:id', getServiceById);

export default router;