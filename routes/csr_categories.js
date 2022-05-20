import { Router } from 'express';
import { getCsrCategories, createCsrCategory, deleteCsrCategory } from '../controllers/csr_categories.js';

const router = Router();

router.post('/', createCsrCategory);
router.get('/', getCsrCategories);
router.delete('/', deleteCsrCategory);

export default router;