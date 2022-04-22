import { Router } from 'express';
import { getServices, createServices, updateServices, deleteServices } from '../controllers/services.js';

let router = Router();

router.post('/', createServices);
router.get('/', getServices);
router.put('/', updateServices);
router.delete('/', deleteServices);

export default router;